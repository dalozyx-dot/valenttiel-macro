#!/usr/bin/env python3
"""Mide cómo se movió cada activo alrededor de un dato y lo guarda en el resumen del día.
Uso: python3 reaccion.py RESUMEN.json 2026-11-25T10:30:00-03:00 "PIB, PCE y subsidios"
Necesita que hayan pasado 30 minutos desde el dato.

Fuentes: cripto y EUR/USD salen de las API públicas de las bolsas, y se publican solo si al menos dos coinciden
(también el oro, con el token PAXG, cuando USAR_YAHOO está en False). La tasa a 10 años es la oficial diaria del Tesoro. El resto, Yahoo Finanzas (no oficial), y solo
si USAR_YAHOO está en True."""
import bisect
import datetime as dt
import json
import pathlib
import re
import statistics
import sys
import time
import urllib.parse
import urllib.request

ACTIVOS = [("nasdaq", "NQ=F"), ("sp500", "ES=F"), ("dow", "YM=F"), ("oro", "GC=F"), ("petroleo", "CL=F"),
           ("dolar", "DX-Y.NYB"), ("eurusd", "EURUSD=X"), ("tasa10", "^TNX"), ("bitcoin", "BTC-USD"), ("ethereum", "ETH-USD"),
           ("apple", "AAPL"), ("microsoft", "MSFT"), ("nvidia", "NVDA"), ("amazon", "AMZN"), ("alphabet", "GOOGL"),
           ("meta", "META"), ("tesla", "TSLA")]
VELA, MEDIA = 300, 1800
USAR_YAHOO = False  # sus términos no permiten este uso: se publican solo los activos con fuente de bolsa
BOLSAS = {"bitcoin": ("XBTUSD", "BTC-USD", "BTCUSDT"), "ethereum": ("ETHUSD", "ETH-USD", "ETHUSDT"),
          "oro": ("PAXGUSD", "PAXG-USD", "PAXGUSDT"), "eurusd": ("EURUSD", None, "EURUSDT")}


def pedir(u):
    q = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"})
    return json.load(urllib.request.urlopen(q, timeout=20))


def cerradas(filas, paso):
    """(fin de la vela, cierre), ordenadas y sin la vela en curso."""
    return sorted((t + paso, p) for t, p in filas if p > 0 and t + paso <= time.time())


def kraken(sim, paso):
    d = pedir(f"https://api.kraken.com/0/public/OHLC?pair={sim}&interval={paso // 60}")
    if d["error"]:
        raise ValueError(d["error"])
    filas = next(v for k, v in d["result"].items() if k != "last")
    return cerradas([(int(x[0]), float(x[4])) for x in filas], paso)


def coinbase(sim, paso):
    d = pedir(f"https://api.exchange.coinbase.com/products/{sim}/candles?granularity={paso}")
    return cerradas([(int(x[0]), float(x[4])) for x in d], paso)


def binance(sim, paso):
    d = pedir(f"https://api.binance.com/api/v3/klines?symbol={sim}&interval={paso // 60}m&limit=1000")
    return cerradas([(int(x[0]) // 1000, float(x[4])) for x in d], paso)


def velas(sim):
    u = f"https://query1.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(sim)}?range=1mo&interval=5m&includePrePost=true"
    q = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"})
    r = json.load(urllib.request.urlopen(q, timeout=20))["chart"]["result"][0]
    c = r["indicators"]["quote"][0]["close"]
    # el cierre de una vela vale al FINAL de la vela; la vela incompleta se descarta
    return [(t + VELA, p) for t, p in zip(r["timestamp"], c) if p and t % VELA == 0 and t + VELA <= time.time()]


def en(v, ts, tolerancia=900):
    """Último precio conocido en ts, si no es más viejo que la tolerancia."""
    i = bisect.bisect_right([t for t, _ in v], ts) - 1
    return v[i][1] if i >= 0 and ts - v[i][0] <= tolerancia else None


def pct(a, b):
    return (b / a - 1) * 100


def habitual(v, ev):
    """Variación absoluta media de 30 min a esta misma hora (una hora antes o después) en los días previos."""
    hab = []
    for t, p in v:
        if t % MEDIA == 0 and t <= ev - 43200 and abs((t - ev + 43200) % 86400 - 43200) <= 3600:
            q = en(v, t + MEDIA)
            if q:
                hab.append(abs(pct(p, q)))
    return sum(hab) / len(hab) if len(hab) >= 20 else None


def ventana(v, ev):
    base, p30, antes = en(v, ev), en(v, ev + MEDIA), en(v, ev - 7200)
    if base is None or p30 is None:
        return None
    return {"antes": pct(antes, base) if antes else None, "r30": pct(base, p30),
            "serie": [[round((t - ev) / 60), round(pct(base, p), 3)] for t, p in v if ev - 7200 <= t <= ev + 5400]}


def armar(w, normal, fuente, cruce=None):
    return {"unidad": "%", "antes": round(w["antes"], 3) if w["antes"] is not None else None, "r30": round(w["r30"], 3),
            "normal30": round(normal, 3), "serie": w["serie"], "fuente": fuente, "fuentes": cruce or 1}


def medir_bolsas(ids, ev):
    """Pide a tres bolsas, usa la mediana y descarta si no coinciden."""
    ws, normales, notas = {}, [], []
    for nombre, f, sim in (("Kraken", kraken, ids[0]), ("Coinbase", coinbase, ids[1]), ("Binance", binance, ids[2])):
        if not sim:
            continue
        try:
            w = ventana(f(sim, VELA), ev)
            if w:
                ws[nombre] = w
            if nombre != "Coinbase":  # Coinbase no da velas de 30 min
                n = habitual(f(sim, MEDIA), ev)
                if n:
                    normales.append(n)
        except Exception as e:
            notas.append(f"{nombre}: {e}")
    if len(ws) < 2 or not normales:
        return None, f"menos de dos bolsas con datos {notas}"
    rs = [w["r30"] for w in ws.values()]
    med, dif = statistics.median(rs), max(rs) - min(rs)
    normal = sum(normales) / len(normales)
    if dif > max(0.6 * normal, 0.25 * abs(med)):
        return None, "las bolsas no coinciden: " + ", ".join(f"{k} {w['r30']:+.3f}" for k, w in ws.items())
    base = next(iter(ws.values()))
    return armar({**base, "r30": med}, normal, " + ".join(ws), len(ws)), f"diferencia máxima {dif:.3f}"


def medir_yahoo(sim, ev):
    v = velas(sim)
    w, n = ventana(v, ev), habitual(v, ev)
    if not w or n is None:
        return None, "sin precios suficientes alrededor del dato"
    if len({p for t, p in v if ev - 3600 <= t <= ev + MEDIA}) < 4:
        return None, "el precio no se actualizaba"
    return armar(w, n, "Yahoo Finanzas (no oficial)"), ""


def tasa_oficial():
    mes = dt.date.today()
    for m in (mes, mes.replace(day=1) - dt.timedelta(days=1)):
        u = ("https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml"
             f"?data=daily_treasury_yield_curve&field_tdr_date_value_month={m:%Y%m}")
        x = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=25).read().decode()
        filas = re.findall(r"<d:NEW_DATE[^>]*>(\d{4}-\d{2}-\d{2}).*?<d:BC_10YEAR[^>]*>([\d.]+)<", x, re.S)
        if filas:
            f, val = max(filas)
            if not 0 < float(val) < 20:
                raise ValueError("valor fuera de rango")
            return {"fecha": f, "valor": float(val), "fuente": "Departamento del Tesoro de EE.UU."}
    raise ValueError("sin filas")


def main():
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    ruta, cuando, nombre = pathlib.Path(sys.argv[1]), dt.datetime.fromisoformat(sys.argv[2]), sys.argv[3]
    if cuando.tzinfo is None:
        sys.exit("Falta la zona horaria (-03:00)")
    ev = int(cuando.timestamp())
    if time.time() < ev + MEDIA + 60:
        sys.exit("Todavía no pasaron 30 minutos desde el dato.")
    d, ok = json.loads(ruta.read_text(encoding="utf-8")), []
    for i, s in ACTIVOS:
        if i == "tasa10":
            continue
        try:
            if i in BOLSAS and not (i == "oro" and USAR_YAHOO):  # el futuro del oro es mejor referencia que el token
                m, nota = medir_bolsas(BOLSAS[i], ev)
            elif USAR_YAHOO:
                m, nota = medir_yahoo(s, ev)
            else:
                m, nota = None, "sin fuente autorizada"
        except Exception as e:
            m, nota = None, f"no se pudo leer ({e})"
        if m:
            ok.append({"id": i, **m})
            print(f"{i:10} 30 min {m['r30']:+.3f} | habitual {m['normal30']:.3f} % | {m['fuente']} {nota}")
        else:
            print(f"{i:10} NO SE PUBLICA: {nota}")
    try:
        d["tasa10"] = tasa_oficial()
        print("tasa10    ", d["tasa10"])
    except Exception as e:
        print(f"tasa10     no se pudo leer la oficial ({e})")
    if not ok:
        sys.exit("No se guardó nada.")
    d["reaccion"] = {"evento": nombre, "cuando": sys.argv[2], "medido": dt.datetime.now(cuando.tzinfo).isoformat(timespec="seconds"),
                     "activos": ok}
    ruta.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


main()
