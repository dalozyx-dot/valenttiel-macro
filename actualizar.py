#!/usr/bin/env python3
"""Valida los resúmenes de datos/ y rehace datos/index.json.
Uso:
  python3 actualizar.py                     rehace el índice
  python3 actualizar.py --revisar X.json    solo valida un borrador
  python3 actualizar.py --publicar X.json   lo valida, lo copia a datos/ y lo sube
Si algo está mal, no toca nada y explica qué corregir."""
import datetime as dt
import json
import pathlib
import re
import shutil
import subprocess
import sys
import urllib.request

DATOS = pathlib.Path(__file__).resolve().parent / "datos"
TEXTOS = ["fecha", "actualizado", "titular", "bajada", "fed", "mensaje"]
LISTAS = {"termometro": ["factor", "dato", "posicion", "texto"], "ideas": ["titulo", "texto"],
          "datos": ["nombre", "salio", "sorpresa"], "agenda": ["cuando", "evento", "impacto"],
          "fuentes": ["nombre", "url"]}


# Listas opcionales: dichos de personas que mueven el mercado y resultados verificados de otros países.
OPCIONALES = {"dichos": ["quien", "cargo", "cuando", "dijo", "impacto", "fuente"],
              "mundo": ["cuando", "pais", "evento", "salio", "fuente"]}
FEED_FF = "https://nfs.faireconomy.media/ff_calendar_thisweek.xml"


def con_zona(s):
    t = dt.datetime.fromisoformat(s)
    if t.tzinfo is None:
        raise ValueError("falta la zona horaria (-03:00)")
    return t


def revisar(ruta):
    e, d = [], json.loads(ruta.read_text(encoding="utf-8"))
    for k in TEXTOS:
        if not isinstance(d.get(k), str) or not d[k].strip():
            e.append(f"falta '{k}'")
    for k, campos in LISTAS.items():
        if not isinstance(d.get(k), list) or (not d[k] and k != "datos"):  # la previa de las 00:05 todavía no tiene datos
            e.append(f"'{k}' tiene que ser una lista con algo adentro")
            continue
        for i, x in enumerate(d[k]):
            e += [f"{k}[{i}]: falta '{c}'" for c in campos if x.get(c) in (None, "")]
    for k, campos in OPCIONALES.items():
        if k not in d:
            continue
        if not isinstance(d[k], list):
            e.append(f"'{k}' tiene que ser una lista")
            continue
        for i, x in enumerate(d[k]):
            e += [f"{k}[{i}]: falta '{c}'" for c in campos if x.get(c) in (None, "")]
            f = x.get("fuente")
            if not isinstance(f, dict) or not str(f.get("url", "")).startswith("https://") or not f.get("nombre"):
                e.append(f"{k}[{i}]: la fuente tiene que tener nombre y url https")
            if x.get("cuando"):
                try:
                    con_zona(x["cuando"])
                except ValueError as y:
                    e.append(f"{k}[{i}]: '{x['cuando']}' {y}")
            if k == "dichos" and x.get("impacto") not in ("alto", "medio", "bajo"):
                e.append(f"dichos[{i}]: impacto tiene que ser alto, medio o bajo")
            if k == "dichos" and len(str(x.get("cita", "")).split()) > 30:
                e.append(f"dichos[{i}]: la cita textual no puede pasar de 30 palabras")
    if not isinstance(d.get("mercado"), list):
        e.append("'mercado' tiene que ser una lista de textos")
    if e:
        return d, e
    if d["fecha"] != ruta.stem:
        e.append("la fecha no coincide con el nombre del archivo")
    for donde, s in [("actualizado", d["actualizado"])] + [("agenda", a["cuando"]) for a in d["agenda"]]:
        try:
            con_zona(s)
        except ValueError as x:
            e.append(f"{donde}: '{s}' {x}")
    for x in d["datos"]:
        if x["sorpresa"] not in ("mayor", "menor", "igual", "sd"):
            e.append(f"sorpresa inválida en {x['nombre']}")
    for x in d["termometro"]:
        if not isinstance(x["posicion"], (int, float)) or not 0 <= x["posicion"] <= 100:
            e.append(f"posicion de {x['factor']} tiene que ir de 0 a 100")
    e += [f"fuente sin https: {f['nombre']}" for f in d["fuentes"] if not f["url"].startswith("https://")]
    return d, e


def borrador(ruta):
    r = pathlib.Path(ruta)
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", r.stem):
        sys.exit("El borrador se tiene que llamar AAAA-MM-DD.json")
    try:
        e = revisar(r)[1]
    except Exception as x:
        e = [str(x)]
    if e:
        print(f"{r.name}:", *e, sep="\n  - ")
        sys.exit("El borrador tiene errores. No se publicó nada.")
    return r


def git(*a):
    subprocess.run(["git", "-C", str(DATOS.parent), *a], check=True)


def novedad(viejo, nuevo):
    """Una línea con lo que cambió entre lo publicado y el borrador."""
    if not viejo:
        return "Primer resumen del día: " + nuevo["titular"]
    antes = {x["nombre"]: x["salio"] for x in viejo.get("datos", [])}
    salieron = [f'{x["nombre"]} {x["salio"]}' for x in nuevo["datos"] if antes.get(x["nombre"]) != x["salio"]]
    vistos = {a["evento"]: a.get("salio") for a in viejo.get("agenda", [])}
    for a in nuevo["agenda"]:
        corto = a["evento"].split("(")[0].strip()
        if a.get("salio") and vistos.get(a["evento"]) != a["salio"] and not any(corto in x for x in salieron):
            salieron.append(f'{a["evento"]}: {a["salio"]}')
    partes = []
    if salieron:
        partes.append("Datos nuevos: " + "; ".join(salieron[:4]) + (f" y {len(salieron) - 4} más" if len(salieron) > 4 else "") + ".")
    rv, rn = viejo.get("reaccion") or {}, nuevo.get("reaccion") or {}
    if rn and rn.get("cuando") != rv.get("cuando"):
        partes.append(f'Se midió cómo se movieron {len(rn.get("activos", []))} activos tras {rn["evento"]}.')
    return " ".join(partes) or "Se actualizó la lectura del mercado."


def publicar(ruta):
    r = borrador(ruta)
    destino = DATOS / r.name
    viejo = json.loads(destino.read_text(encoding="utf-8")) if destino.exists() else None
    nuevo = json.loads(r.read_text(encoding="utf-8"))
    propia = nuevo.pop("novedad", None)  # línea opcional escrita a mano para el historial
    if viejo and con_zona(nuevo["actualizado"]) < con_zona(viejo["actualizado"]):
        sys.exit("El borrador es más viejo que lo publicado. No se publicó nada.")
    for k in ("reaccion", "tasa10"):  # lo que ya se midió hoy no se pierde si el borrador no lo trae
        if viejo and viejo.get(k) and not nuevo.get(k):
            nuevo[k] = viejo[k]
    for k in ("dichos", "mundo"):  # lo que ya se contó hoy se suma, no se pisa
        if viejo and viejo.get(k):
            ya = {(x.get("quien") or x.get("pais"), x.get("cuando"), x.get("evento", "")) for x in nuevo.get(k, [])}
            nuevo[k] = nuevo.get(k, []) + [x for x in viejo[k] if (x.get("quien") or x.get("pais"), x.get("cuando"), x.get("evento", "")) not in ya]
            nuevo[k].sort(key=lambda x: x["cuando"], reverse=(k == "dichos"))
    if viejo and nuevo["actualizado"] == viejo["actualizado"]:
        nuevo["novedades"] = viejo.get("novedades", [])
    else:
        nuevo["novedades"] = (viejo or {}).get("novedades", []) + [{"cuando": nuevo["actualizado"], "texto": propia or novedad(viejo, nuevo)}]
    destino.write_text(json.dumps(nuevo, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    indice()
    mundo()
    git("add", "datos")
    if subprocess.run(["git", "-C", str(DATOS.parent), "diff", "--cached", "--quiet", "--", "datos"]).returncode == 0:
        print("No hay cambios nuevos en los datos.")
    else:
        git("commit", "-q", "-m", f"Resumen {r.stem}", "--", "datos")
    # En la Mac se usa la credencial de gh; en la nube, la que trae el entorno.
    gh = shutil.which("gh") or str(pathlib.Path.home() / ".local/bin/gh")
    cred = ["-c", "credential.helper=", "-c", f"credential.helper=!{gh} auth git-credential"] if pathlib.Path(gh).exists() else []
    for intento in range(3):  # si otra publicación subió algo antes, se rebasa y se reintenta
        try:
            git(*cred, "pull", "-q", "--rebase", "origin", "main")
            git(*cred, "push", "-q", "origin", "HEAD:main")
            break
        except subprocess.CalledProcessError:
            if intento == 2:
                raise
    print("Publicado. La página tarda uno o dos minutos en mostrarlo.")


def mundo():
    """Copia del calendario mundial de la semana (Forex Factory) por si el servidor en vivo no responde.
    Si el feed falla, queda la copia anterior y se publica igual."""
    try:
        req = urllib.request.Request(FEED_FF, headers={"User-Agent": "valenttiel-macro-calendario"})
        xml = urllib.request.urlopen(req, timeout=15).read().decode("windows-1252")
        imp = {"High": 3, "Medium": 2, "Low": 1}
        ev = []
        for b in re.findall(r"<event>(.*?)</event>", xml, re.S):
            c = lambda n: (re.search(rf"<{n}>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</{n}>", b, re.S) or [None, ""])[1].replace("&amp;", "&").strip()
            m, d_, a = c("date").split("-")
            dia, h = f"{a}-{m}-{d_}", re.fullmatch(r"(\d{1,2}):(\d{2})(am|pm)", c("time").lower())
            t = f"{dia}T{int(h[1]) % 12 + (12 if h[3] == 'pm' else 0):02d}:{h[2]}:00Z" if h else None
            url = c("url") if c("url").startswith("https://www.forexfactory.com/") else ""
            ev.append({"t": t, "dia": dia, "pais": c("country")[:4], "titulo": c("title")[:120], "imp": imp.get(c("impact"), 0),
                       "prev": c("forecast")[:20], "ant": c("previous")[:20], "url": url})
        if not ev:
            raise ValueError("feed vacío")
        ev.sort(key=lambda x: x["t"] or x["dia"])
        leido = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
        (DATOS / "mundo.json").write_text(json.dumps({"fuente": "Forex Factory", "leido": leido, "eventos": ev}, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"Calendario mundial: {len(ev)} eventos.")
    except Exception as x:
        print("No se pudo actualizar el calendario mundial (queda la copia anterior):", x)


def indice():
    dias, mal = [], False
    for r in sorted(DATOS.glob("*.json"), reverse=True):
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", r.stem):
            continue
        try:
            d, e = revisar(r)
        except Exception as x:  # JSON roto o estructura inesperada
            d, e = {}, [str(x)]
        if e:
            mal = True
            print(f"{r.name}:", *e, sep="\n  - ")
        else:
            dias.append({**{k: d[k] for k in ("fecha", "actualizado", "titular")}, "novedades": d.get("novedades", [])})
    if mal or not dias:
        sys.exit("No se actualizó el índice.")
    (DATOS / "index.json").write_text(json.dumps({"dias": dias}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Listo: {len(dias)} día(s). Último: {dias[0]['fecha']}")


if len(sys.argv) == 1:
    indice()
elif len(sys.argv) == 3 and sys.argv[1] == "--revisar":
    print("Borrador correcto:", borrador(sys.argv[2]).name)
elif len(sys.argv) == 3 and sys.argv[1] == "--publicar":
    publicar(sys.argv[2])
else:
    sys.exit(__doc__)
