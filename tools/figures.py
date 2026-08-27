# -*- coding: utf-8 -*-
"""Draws the three figures for the Prof. Cheng page straight from the numbers in
the source spreadsheets. No hand-tidied intermediate step: edit the DATA block,
re-run, and the SVG in assets/img changes with it."""
import os
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img')

LEAF7, LEAF5, LEAF2 = '#23684a', '#4f9c6f', '#cfe4d8'
G4, G5, G3, G2 = '#a3a3a3', '#737373', '#d4d4d4', '#e5e5e5'
RUST, BLACK = '#9a3d22', '#171717'
MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
SANS = "Inter, -apple-system, 'Segoe UI', Roboto, sans-serif"


def head(w, h, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
            f'width="100%" role="img" aria-label="{title}" '
            f'style="font-family:{SANS}">')


# ── Figure 1 ── set #6, root length vs NaCl, ± 5 mM trehalose ────────────────
# Salinity stress test/Experiment Set 6 Root Length.docx, 2026-08-03, day 6.
# SD recomputed from the per-seedling ImageJ values in the same file.
F1 = [
    ('0',   74.951, 2.767, 9,  72.107, 3.182, 9),
    ('75',  34.767, 4.409, 9,  29.176, 8.950, 9),
    ('100', 10.999, 4.067, 9,  13.602, 5.557, 10),
    ('150',  1.753, 0.892, 7,   2.534, 0.940, 9),
]

def fig1():
    W, H = 760, 400
    L, R, T, B = 62, 20, 30, 74
    pw, ph = W - L - R, H - T - B
    ymax = 85
    y = lambda v: T + ph - v / ymax * ph
    s = [head(W, H, 'Set 6 root length against NaCl')]
    for g in range(0, 81, 20):
        s.append(f'<line x1="{L}" y1="{y(g):.1f}" x2="{W-R}" y2="{y(g):.1f}" '
                 f'stroke="{G2}" stroke-width="1"/>')
        s.append(f'<text x="{L-10}" y="{y(g)+4:.1f}" text-anchor="end" font-size="12" '
                 f'fill="{G5}" font-family="{MONO}">{g}</text>')
    s.append(f'<text x="16" y="{T+ph/2:.0f}" font-size="12" fill="{G5}" '
             f'transform="rotate(-90 16 {T+ph/2:.0f})" text-anchor="middle">'
             f'primary root length (mm)</text>')
    step = pw / len(F1)
    bw = 30
    for i, (lab, a, asd, an, b, bsd, bn) in enumerate(F1):
        cx = L + step * i + step / 2
        for j, (v, sd, n, col) in enumerate(((a, asd, an, LEAF7), (b, bsd, bn, LEAF5))):
            bx = cx - bw - 4 + j * (bw + 8)
            s.append(f'<rect x="{bx:.1f}" y="{y(v):.1f}" width="{bw}" '
                     f'height="{T+ph-y(v):.1f}" fill="{col}"/>')
            m = bx + bw / 2
            s.append(f'<line x1="{m:.1f}" y1="{y(v-sd):.1f}" x2="{m:.1f}" y2="{y(v+sd):.1f}" '
                     f'stroke="{BLACK}" stroke-width="1.2"/>')
            for e in (v - sd, v + sd):
                s.append(f'<line x1="{m-5:.1f}" y1="{y(e):.1f}" x2="{m+5:.1f}" y2="{y(e):.1f}" '
                         f'stroke="{BLACK}" stroke-width="1.2"/>')
            s.append(f'<text x="{m:.1f}" y="{y(v+sd)-8:.1f}" text-anchor="middle" '
                     f'font-size="11.5" font-family="{MONO}" fill="{BLACK}">{v:.1f}</text>')
            s.append(f'<text x="{m:.1f}" y="{T+ph+15:.0f}" text-anchor="middle" '
                     f'font-size="10" font-family="{MONO}" fill="{G4}">n={n}</text>')
        s.append(f'<text x="{cx:.1f}" y="{T+ph+34:.0f}" text-anchor="middle" font-size="13" '
                 f'font-family="{MONO}" fill="{BLACK}">{lab}</text>')
    s.append(f'<text x="{L+pw/2:.0f}" y="{H-24}" text-anchor="middle" font-size="12" '
             f'fill="{G5}">NaCl (mM)</text>')
    s.append(f'<line x1="{L}" y1="{T+ph}" x2="{W-R}" y2="{T+ph}" stroke="{BLACK}" stroke-width="1.2"/>')
    for j, (col, lab) in enumerate(((LEAF7, 'NaCl alone'), (LEAF5, '+ 5 mM trehalose'))):
        lx = L + j * 150
        s.append(f'<rect x="{lx}" y="{T-22}" width="11" height="11" fill="{col}"/>')
        s.append(f'<text x="{lx+17}" y="{T-12}" font-size="12" fill="{G5}">{lab}</text>')
    s.append('</svg>')
    return '\n'.join(s)


# ── Figure 2 ── set #5 trial 2: roots flat, chlorophyll graded ───────────────
# Root length: Experiment Set 5 Trial 2 Root Length.docx, 2026-07-27, n = 8.
# Chlorophyll: Chlorophyll content for Agar plate.xlsx, sheet "Exp set #5 trial 2
# 20260720", ratio-to-control block K22:K31.
F2 = [('150', 4.259, 0.677, 0.661), ('150+1', 4.125, 0.586, 0.699),
      ('150+5', 2.003, 1.116, 0.754), ('150+10', 4.714, 0.879, 0.887)]

def fig2():
    W, H = 760, 360
    T, B = 46, 66
    ph = H - T - B
    panels = [(58, 300), (438, 300)]
    s = [head(W, H, 'Trehalose dose response, roots against chlorophyll')]
    # left: root length
    L, pw = panels[0]
    ymax = 6
    y = lambda v: T + ph - v / ymax * ph
    s.append(f'<text x="{L}" y="{T-22}" font-size="13" font-weight="600" fill="{BLACK}">'
             f'primary root length (mm) &#183; n = 8</text>')
    for g in (0, 2, 4, 6):
        s.append(f'<line x1="{L}" y1="{y(g):.1f}" x2="{L+pw}" y2="{y(g):.1f}" stroke="{G2}"/>')
        s.append(f'<text x="{L-8}" y="{y(g)+4:.1f}" text-anchor="end" font-size="11" '
                 f'fill="{G5}" font-family="{MONO}">{g}</text>')
    step = pw / len(F2)
    for i, (lab, v, sd, _) in enumerate(F2):
        cx = L + step * i + step / 2
        s.append(f'<rect x="{cx-20:.1f}" y="{y(v):.1f}" width="40" height="{T+ph-y(v):.1f}" fill="{G4}"/>')
        s.append(f'<line x1="{cx:.1f}" y1="{y(v-sd):.1f}" x2="{cx:.1f}" y2="{y(v+sd):.1f}" stroke="{BLACK}" stroke-width="1.2"/>')
        for e in (v - sd, v + sd):
            s.append(f'<line x1="{cx-5:.1f}" y1="{y(e):.1f}" x2="{cx+5:.1f}" y2="{y(e):.1f}" stroke="{BLACK}" stroke-width="1.2"/>')
        s.append(f'<text x="{cx:.1f}" y="{y(v+sd)-7:.1f}" text-anchor="middle" font-size="11" font-family="{MONO}">{v:.2f}</text>')
        s.append(f'<text x="{cx:.1f}" y="{T+ph+17:.0f}" text-anchor="middle" font-size="10.5" font-family="{MONO}" fill="{G5}">{lab}</text>')
    s.append(f'<line x1="{L}" y1="{T+ph}" x2="{L+pw}" y2="{T+ph}" stroke="{BLACK}" stroke-width="1.2"/>')
    # right: chlorophyll ratio
    L2, pw2 = panels[1]
    y2 = lambda v: T + ph - (v - 0.6) / 0.35 * ph
    s.append(f'<text x="{L2}" y="{T-22}" font-size="13" font-weight="600" fill="{BLACK}">'
             f'total chlorophyll, ratio to control</text>')
    for g in (0.6, 0.7, 0.8, 0.9):
        s.append(f'<line x1="{L2}" y1="{y2(g):.1f}" x2="{L2+pw2}" y2="{y2(g):.1f}" stroke="{G2}"/>')
        s.append(f'<text x="{L2-8}" y="{y2(g)+4:.1f}" text-anchor="end" font-size="11" fill="{G5}" font-family="{MONO}">{g:.1f}</text>')
    step2 = pw2 / len(F2)
    pts = []
    for i, (lab, _, _, r) in enumerate(F2):
        cx = L2 + step2 * i + step2 / 2
        pts.append((cx, y2(r)))
        s.append(f'<text x="{cx:.1f}" y="{T+ph+17:.0f}" text-anchor="middle" font-size="10.5" font-family="{MONO}" fill="{G5}">{lab}</text>')
    s.append('<polyline points="' + ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts) +
             f'" fill="none" stroke="{LEAF7}" stroke-width="2.5"/>')
    for (cx, cy), (lab, _, _, r) in zip(pts, F2):
        s.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="5" fill="{LEAF7}"/>')
        s.append(f'<text x="{cx:.1f}" y="{cy-12:.1f}" text-anchor="middle" font-size="11" font-family="{MONO}" fill="{LEAF7}">{r:.3f}</text>')
    s.append(f'<line x1="{L2}" y1="{T+ph}" x2="{L2+pw2}" y2="{T+ph}" stroke="{BLACK}" stroke-width="1.2"/>')
    s.append(f'<text x="{W/2:.0f}" y="{H-22}" text-anchor="middle" font-size="12" fill="{G5}">'
             f'NaCl (mM) + trehalose (mM), same plates, same day</text>')
    s.append('</svg>')
    return '\n'.join(s)


# ── Figure 3 ── hydroponic prototypes: germination rate ─────────────────────
# Initial ideas/Hydroponic design.pptx, slides 4-8.
F3 = [('P1', 40, '300–500 mL', 'in water'), ('P2', 30, '85 mL', 'in water'),
      ('P3', 10, '70 mL', 'in water'), ('P4', 100, '250 mL', 'from agar'),
      ('P5', 70, '250 mL', 'in water')]

def fig3():
    W, H = 760, 340
    L, R, T, B = 58, 20, 42, 76
    pw, ph = W - L - R, H - T - B
    y = lambda v: T + ph - v / 100 * ph
    s = [head(W, H, 'Germination rate by hydroponic prototype')]
    for g in (0, 25, 50, 75, 100):
        s.append(f'<line x1="{L}" y1="{y(g):.1f}" x2="{W-R}" y2="{y(g):.1f}" stroke="{G2}"/>')
        s.append(f'<text x="{L-8}" y="{y(g)+4:.1f}" text-anchor="end" font-size="11" fill="{G5}" font-family="{MONO}">{g}</text>')
    s.append(f'<text x="14" y="{T+ph/2:.0f}" font-size="12" fill="{G5}" '
             f'transform="rotate(-90 14 {T+ph/2:.0f})" text-anchor="middle">germination (%)</text>')
    step = pw / len(F3)
    for i, (lab, v, vol, how) in enumerate(F3):
        cx = L + step * i + step / 2
        col = LEAF7 if how == 'from agar' else G4
        s.append(f'<rect x="{cx-34:.1f}" y="{y(v):.1f}" width="68" height="{T+ph-y(v):.1f}" fill="{col}"/>')
        s.append(f'<text x="{cx:.1f}" y="{y(v)-9:.1f}" text-anchor="middle" font-size="14" '
                 f'font-family="{MONO}" font-weight="700" fill="{col}">{v}%</text>')
        s.append(f'<text x="{cx:.1f}" y="{T+ph+18:.0f}" text-anchor="middle" font-size="13" '
                 f'font-family="{MONO}" fill="{BLACK}">{lab}</text>')
        s.append(f'<text x="{cx:.1f}" y="{T+ph+33:.0f}" text-anchor="middle" font-size="10.5" fill="{G5}">{vol}</text>')
        s.append(f'<text x="{cx:.1f}" y="{T+ph+47:.0f}" text-anchor="middle" font-size="10.5" '
                 f'fill="{LEAF7 if how=="from agar" else G4}">{how}</text>')
    s.append(f'<line x1="{L}" y1="{T+ph}" x2="{W-R}" y2="{T+ph}" stroke="{BLACK}" stroke-width="1.2"/>')
    s.append(f'<text x="{L}" y="{T-18}" font-size="12" fill="{G5}">'
             f'P1–P3 and P5 germinate seed in the medium. P4 transfers agar-grown seedlings.</text>')
    s.append('</svg>')
    return '\n'.join(s)


for name, fn in (('fig-rootlength.svg', fig1), ('fig-trehalose.svg', fig2),
                 ('fig-prototypes.svg', fig3)):
    p = os.path.join(OUT, name)
    open(p, 'w').write(fn())
    print(name, os.path.getsize(p), 'bytes')
