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

DATOS = pathlib.Path(__file__).resolve().parent / "datos"
TEXTOS = ["fecha", "actualizado", "titular", "bajada", "fed", "mensaje"]
LISTAS = {"termometro": ["factor", "dato", "posicion", "texto"], "ideas": ["titulo", "texto"],
          "datos": ["nombre", "salio", "sorpresa"], "agenda": ["cuando", "evento", "impacto"],
          "fuentes": ["nombre", "url"]}


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
        if not isinstance(d.get(k), list) or not d[k]:
            e.append(f"'{k}' tiene que ser una lista con algo adentro")
            continue
        for i, x in enumerate(d[k]):
            e += [f"{k}[{i}]: falta '{c}'" for c in campos if x.get(c) in (None, "")]
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
    if viejo and nuevo["actualizado"] == viejo["actualizado"]:
        nuevo["novedades"] = viejo.get("novedades", [])
    else:
        nuevo["novedades"] = (viejo or {}).get("novedades", []) + [{"cuando": nuevo["actualizado"], "texto": propia or novedad(viejo, nuevo)}]
    destino.write_text(json.dumps(nuevo, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    indice()
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
