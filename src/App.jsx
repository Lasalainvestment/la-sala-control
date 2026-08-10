import { useState, useEffect, useCallback, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

// ─── Pre-loaded data extracted from POS receipts (Miércoles 01 Abril 2026) ───
// ⚠️ REGLA FIJA: costo_financiero = round(tarjeta * 0.05). SIEMPRE se aplica, todos los días.
// Es la comisión del datáfono. Va dentro de la identidad:
//   neto_sala = venta_total − pizza_80 − gastos − nomina − costo_financiero
// El campo estuvo en 0 por error entre el 27-may y el 29-jul (58 días, $2.848.060 sin aplicar).
// Corregido retroactivamente el 30-jul-2026. NO volver a insertar días con costo_financiero: 0
// cuando tarjeta > 0.
const PRELOADED_CUADRES = [
  {
    date: "2026-03-30", venta_total: 1036600,
    estanco: 0, cocteles: 624000, pizzeria: 412600, otros_venta: 0,
    efectivo: 5000, tarjeta: 535800, otros_pago: 495800,
    pizza_80: 330080, gastos: 340800, nomina: 155000, costo_financiero: 26790,
    neto_sala: 183930, faltante: 0,
  },
  {
    date: "2026-03-31", venta_total: 1501000,
    estanco: 0, cocteles: 1038000, pizzeria: 463000, otros_venta: 0,
    efectivo: 0, tarjeta: 919600, otros_pago: 581400,
    pizza_80: 370400, gastos: 426400, nomina: 155000, costo_financiero: 45980,
    neto_sala: 503220, faltante: 0,
  },
  {
    date: "2026-04-01", venta_total: 2355000,
    estanco: 593000, cocteles: 972600, pizzeria: 789400, otros_venta: 0,
    efectivo: 0, tarjeta: 1747000, otros_pago: 608000,
    pizza_80: 631520, gastos: 453000, nomina: 155000, costo_financiero: 87350,
    neto_sala: 1028130, faltante: 0,
  },
  {
    date: "2026-04-02", venta_total: 3212600,
    estanco: 721000, cocteles: 1660000, pizzeria: 831600, otros_venta: 0,
    efectivo: 0, tarjeta: 2330000, otros_pago: 882600,
    pizza_80: 665280, gastos: 727600, nomina: 155000, costo_financiero: 116500,
    neto_sala: 1548220, faltante: 0,
  },
  {
    date: "2026-04-03", venta_total: 2414200,
    estanco: 564000, cocteles: 1037000, pizzeria: 813200, otros_venta: 0,
    efectivo: 3000, tarjeta: 1834800, otros_pago: 576400,
    pizza_80: 650560, gastos: 301400, nomina: 275000, costo_financiero: 91740,
    neto_sala: 1095500, faltante: 0,
  },
  {
    date: "2026-04-04", venta_total: 1501200,
    estanco: 449000, cocteles: 655000, pizzeria: 397200, otros_venta: 0,
    efectivo: 2800, tarjeta: 820400, otros_pago: 678000,
    pizza_80: 317760, gastos: 403000, nomina: 275000, costo_financiero: 41020,
    neto_sala: 464420, faltante: 0,
  },
  {
    date: "2026-04-05", venta_total: 306000,
    estanco: 40000, cocteles: 146000, pizzeria: 120000, otros_venta: 0,
    efectivo: 300, tarjeta: 0, otros_pago: 305700,
    pizza_80: 96000, gastos: 165700, nomina: 140000, costo_financiero: 0,
    neto_sala: -95700, faltante: 0,
  },
  {
    date: "2026-04-06", venta_total: 2040400,
    estanco: 472000, cocteles: 636000, pizzeria: 932400, otros_venta: 0,
    efectivo: 397500, tarjeta: 0, otros_pago: 1642900,
    pizza_80: 745920, gastos: 1437900, nomina: 205000, costo_financiero: 0,
    neto_sala: -348420, faltante: 0,
  },
  {
    date: "2026-04-18", venta_total: 3039400,
    estanco: 675000, cocteles: 1309000, pizzeria: 1055400, otros_venta: 0,
    efectivo: 1000, tarjeta: 2813400, otros_pago: 225000,
    pizza_80: 844320, gastos: 10000, nomina: 215000, costo_financiero: 140670,
    neto_sala: 1829410, faltante: 0,
  },
  {
    date: "2026-04-19", venta_total: 197000,
    estanco: 26000, cocteles: 72000, pizzeria: 99000, otros_venta: 0,
    efectivo: 14000, tarjeta: 0, otros_pago: 183000,
    pizza_80: 79200, gastos: 28000, nomina: 155000, costo_financiero: 0,
    neto_sala: -65200, faltante: 0,
  },
  {
    date: "2026-04-20", venta_total: 102000,
    estanco: 14000, cocteles: 15000, pizzeria: 73000, otros_venta: 0,
    efectivo: 3000, tarjeta: 94000, otros_pago: 5000,
    pizza_80: 58400, gastos: 5000, nomina: 0, costo_financiero: 4700,
    neto_sala: 33900, faltante: 0,
  },
  {
    date: "2026-04-21", venta_total: 437800,
    estanco: 56200, cocteles: 197000, pizzeria: 184600, otros_venta: 0,
    efectivo: 3000, tarjeta: 274800, otros_pago: 160000,
    pizza_80: 147680, gastos: 5000, nomina: 155000, costo_financiero: 13740,
    neto_sala: 116380, faltante: 0,
  },
  {
    date: "2026-04-22", venta_total: 0,
    estanco: 0, cocteles: 0, pizzeria: 0, otros_venta: 0,
    efectivo: 0, tarjeta: 0, otros_pago: 0,
    pizza_80: 0, gastos: 0, nomina: 155000, costo_financiero: 0,
    neto_sala: -155000, faltante: 0,
  },
  {
    date: "2026-04-23", venta_total: 700600,
    estanco: 225000, cocteles: 166000, pizzeria: 309600, otros_venta: 0,
    efectivo: 2300, tarjeta: 399200, otros_pago: 299100,
    pizza_80: 247680, gastos: 144100, nomina: 155000, costo_financiero: 19960,
    neto_sala: 133860, faltante: 0,
  },
  {
    date: "2026-04-24", venta_total: 1403800,
    estanco: 107000, cocteles: 1054000, pizzeria: 242800, otros_venta: 0,
    efectivo: 9000, tarjeta: 1184800, otros_pago: 210000,
    pizza_80: 194240, gastos: 10000, nomina: 200000, costo_financiero: 59240,
    neto_sala: 940320, faltante: 0,
  },
  {
    date: "2026-04-25", venta_total: 809400,
    estanco: 364000, cocteles: 93000, pizzeria: 352400, otros_venta: 0,
    efectivo: 3600, tarjeta: 453800, otros_pago: 352000,
    pizza_80: 281920, gastos: 152000, nomina: 200000, costo_financiero: 22690,
    neto_sala: 152790, faltante: 0,
  },
  {
    date: "2026-04-26", venta_total: 504000,
    estanco: 46000, cocteles: 205000, pizzeria: 253000, otros_venta: 0,
    efectivo: 20900, tarjeta: 291200, otros_pago: 191900,
    pizza_80: 202400, gastos: 36900, nomina: 155000, costo_financiero: 14560,
    neto_sala: 95140, faltante: 0,
  },
  {
    date: "2026-04-27", venta_total: 222400,
    estanco: 6000, cocteles: 167000, pizzeria: 49400, otros_venta: 0,
    efectivo: 0, tarjeta: 178000, otros_pago: 213200,
    pizza_80: 39520, gastos: 44400, nomina: 168800, costo_financiero: 8900,
    neto_sala: -39220, faltante: 0,
  },
  {
    date: "2026-04-28", venta_total: 657600,
    estanco: 238000, cocteles: 42000, pizzeria: 377600, otros_venta: 0,
    efectivo: 700, tarjeta: 92000, otros_pago: 564900,
    pizza_80: 302080, gastos: 409900, nomina: 155000, costo_financiero: 4600,
    neto_sala: -213980, faltante: 0,
  },
  {
    date: "2026-04-29", venta_total: 839600,
    estanco: 67000, cocteles: 470000, pizzeria: 302600, otros_venta: 0,
    efectivo: 32500, tarjeta: 795600, otros_pago: 11500,
    pizza_80: 242080, gastos: 11500, nomina: 0, costo_financiero: 39780,
    neto_sala: 546240, faltante: 0,
  },
  {
    date: "2026-04-30", venta_total: 3561200,
    estanco: 1141000, cocteles: 1206000, pizzeria: 1214200, otros_venta: 0,
    efectivo: 186050, tarjeta: 2708400, otros_pago: 666750,
    pizza_80: 971360, gastos: 446750, nomina: 220000, costo_financiero: 135420,
    neto_sala: 1787670, faltante: 0,
  },
  {
    date: "2026-05-01", venta_total: 3811200,
    estanco: 905000, cocteles: 2001000, pizzeria: 905200, otros_venta: 0,
    efectivo: 234800, tarjeta: 3330400, otros_pago: 246000,
    pizza_80: 724160, gastos: 26000, nomina: 220000, costo_financiero: 166520,
    neto_sala: 2674520, faltante: 0,
  },
  {
    date: "2026-05-02", venta_total: 2098000,
    estanco: 802000, cocteles: 898000, pizzeria: 398000, otros_venta: 0,
    efectivo: 494700, tarjeta: 1302000, otros_pago: 301300,
    pizza_80: 318400, gastos: 146300, nomina: 155000, costo_financiero: 65100,
    neto_sala: 1413200, faltante: 0,
  },
  {
    date: "2026-05-03", venta_total: 119600,
    estanco: 6000, cocteles: 72000, pizzeria: 41600, otros_venta: 0,
    efectivo: 0, tarjeta: 119600, otros_pago: 160000,
    pizza_80: 33280, gastos: 5000, nomina: 155000, costo_financiero: 5980,
    neto_sala: -79660, faltante: -160000,
  },
  {
    date: "2026-05-04", venta_total: 112000,
    estanco: 60000, cocteles: 15000, pizzeria: 37000, otros_venta: 0,
    efectivo: 37000, tarjeta: 70000, otros_pago: 5000,
    pizza_80: 29600, gastos: 5000, nomina: 0, costo_financiero: 3500,
    neto_sala: 73900, faltante: 0,
  },
  {
    date: "2026-05-05", venta_total: 114000,
    estanco: 0, cocteles: 36000, pizzeria: 78000, otros_venta: 0,
    efectivo: 0, tarjeta: 114000, otros_pago: 0,
    pizza_80: 62400, gastos: 0, nomina: 0, costo_financiero: 5700,
    neto_sala: 45900, faltante: 0,
  },
  {
    date: "2026-05-06", venta_total: 951400,
    estanco: 155000, cocteles: 410000, pizzeria: 386400, otros_venta: 0,
    efectivo: 5150, tarjeta: 933400, otros_pago: 12850,
    pizza_80: 309120, gastos: 12850, nomina: 0, costo_financiero: 46670,
    neto_sala: 582760, faltante: 0,
  },
  {
    date: "2026-05-07", venta_total: 951800,
    estanco: 114000, cocteles: 190000, pizzeria: 647800, otros_venta: 0,
    efectivo: 250000, tarjeta: 696800, otros_pago: 5000,
    pizza_80: 518240, gastos: 5000, nomina: 0, costo_financiero: 34840,
    neto_sala: 393720, faltante: 0,
  },
  {
    date: "2026-05-08", venta_total: 2036600,
    estanco: 381000, cocteles: 1115000, pizzeria: 540600, otros_venta: 0,
    efectivo: 470600, tarjeta: 1478000, otros_pago: 88000,
    pizza_80: 432480, gastos: 88000, nomina: 0, costo_financiero: 73900,
    neto_sala: 1442220, faltante: 0,
  },
  {
    date: "2026-05-09", venta_total: 3699000,
    estanco: 735000, cocteles: 1476000, pizzeria: 1488000, otros_venta: 0,
    efectivo: 78200, tarjeta: 3597000, otros_pago: 23800,
    pizza_80: 1190400, gastos: 23800, nomina: 0, costo_financiero: 179850,
    neto_sala: 2304950, faltante: 0,
  },
  {
    date: "2026-05-10", venta_total: 951200,
    estanco: 127000, cocteles: 299000, pizzeria: 525200, otros_venta: 0,
    efectivo: 0, tarjeta: 688000, otros_pago: 263200,
    pizza_80: 420160, gastos: 193500, nomina: 69700, costo_financiero: 34400,
    neto_sala: 233440, faltante: 0,
  },
  {
    date: "2026-05-11", venta_total: 427400,
    estanco: 69000, cocteles: 151000, pizzeria: 207400, otros_venta: 0,
    efectivo: 43000, tarjeta: 379400, otros_pago: 5000,
    pizza_80: 165920, gastos: 5000, nomina: 0, costo_financiero: 18970,
    neto_sala: 237510, faltante: 0,
  },
  {
    date: "2026-05-12", venta_total: 1407000,
    estanco: 165000, cocteles: 638000, pizzeria: 604000, otros_venta: 0,
    efectivo: 162000, tarjeta: 1070000, otros_pago: 175000,
    pizza_80: 483200, gastos: 5000, nomina: 170000, costo_financiero: 53500,
    neto_sala: 695300, faltante: 0,
  },
  {
    date: "2026-05-13", venta_total: 1314200,
    estanco: 41000, cocteles: 881000, pizzeria: 392200, otros_venta: 0,
    efectivo: 971600, tarjeta: 167600, otros_pago: 175000,
    pizza_80: 313760, gastos: 5000, nomina: 170000, costo_financiero: 8380,
    neto_sala: 817060, faltante: 0,
  },
  {
    date: "2026-05-14", venta_total: 874000,
    estanco: 418000, cocteles: 245000, pizzeria: 211000, otros_venta: 0,
    efectivo: 3200, tarjeta: 691800, otros_pago: 179000,
    pizza_80: 168800, gastos: 179000, nomina: 0, costo_financiero: 34590,
    neto_sala: 491610, faltante: 0,
  },
  {
    date: "2026-05-15", venta_total: 2081000,
    estanco: 568000, cocteles: 1081000, pizzeria: 432000, otros_venta: 0,
    efectivo: 67000, tarjeta: 1894000, otros_pago: 120000,
    pizza_80: 345600, gastos: 120000, nomina: 0, costo_financiero: 94700,
    neto_sala: 1520700, faltante: 0,
  },
  {
    date: "2026-05-16", venta_total: 3466200,
    estanco: 791000, cocteles: 1128000, pizzeria: 1547200, otros_venta: 0,
    efectivo: 227300, tarjeta: 2531800, otros_pago: 707100,
    pizza_80: 1237760, gastos: 707100, nomina: 0, costo_financiero: 126590,
    neto_sala: 1394750, faltante: 0,
  },
  {
    date: "2026-05-17", venta_total: 1050800,
    estanco: 141000, cocteles: 507000, pizzeria: 402800, otros_venta: 0,
    efectivo: 16850, tarjeta: 968800, otros_pago: 65150,
    pizza_80: 322240, gastos: 65150, nomina: 0, costo_financiero: 48440,
    neto_sala: 614970, faltante: 0,
  },
  {
    date: "2026-05-18", venta_total: 342800,
    estanco: 102000, cocteles: 188000, pizzeria: 52800, otros_venta: 0,
    efectivo: 27800, tarjeta: 125000, otros_pago: 190000,
    pizza_80: 42240, gastos: 5000, nomina: 185000, costo_financiero: 6250,
    neto_sala: 104310, faltante: 0,
  },
  {
    date: "2026-05-19", venta_total: 354000,
    estanco: 0, cocteles: 354000, pizzeria: 0, otros_venta: 0,
    efectivo: 0, tarjeta: 354000, otros_pago: 0,
    pizza_80: 0, gastos: 0, nomina: 0, costo_financiero: 17700,
    neto_sala: 336300, faltante: 0,
  },
  {
    date: "2026-05-20", venta_total: 827400,
    estanco: 133000, cocteles: 387000, pizzeria: 307400, otros_venta: 0,
    efectivo: 2000, tarjeta: 815400, otros_pago: 10000,
    pizza_80: 245920, gastos: 10000, nomina: 0, costo_financiero: 40770,
    neto_sala: 530710, faltante: 0,
  },
  {
    date: "2026-05-21", venta_total: 2269400,
    estanco: 1454000, cocteles: 595000, pizzeria: 220400, otros_venta: 0,
    efectivo: 8800, tarjeta: 1976000, otros_pago: 284600,
    pizza_80: 176320, gastos: 84600, nomina: 200000, costo_financiero: 98800,
    neto_sala: 1709680, faltante: 0,
  },
  {
    date: "2026-05-22", venta_total: 5817800,
    estanco: 3396000, cocteles: 917000, pizzeria: 1504800, otros_venta: 0,
    efectivo: 449200, tarjeta: 4557600, otros_pago: 811000,
    pizza_80: 1203840, gastos: 141000, nomina: 670000, costo_financiero: 227880,
    neto_sala: 3575080, faltante: 0,
  },
  {
    date: "2026-05-23", venta_total: 2443400,
    estanco: 449000, cocteles: 894000, pizzeria: 1100400, otros_venta: 0,
    efectivo: 21800, tarjeta: 1797000, otros_pago: 624600,
    pizza_80: 880320, gastos: 364600, nomina: 260000, costo_financiero: 89850,
    neto_sala: 848630, faltante: 0,
  },
  {
    date: "2026-05-24", venta_total: 196600,
    estanco: 82000, cocteles: 40000, pizzeria: 74600, otros_venta: 0,
    efectivo: 0, tarjeta: 196600, otros_pago: 0,
    pizza_80: 59680, gastos: 0, nomina: 0, costo_financiero: 9830,
    neto_sala: 127090, faltante: 0,
  },
  {
    date: "2026-05-25", venta_total: 386000,
    estanco: 46000, cocteles: 286000, pizzeria: 54000, otros_venta: 0,
    efectivo: 24000, tarjeta: 352000, otros_pago: 10000,
    pizza_80: 43200, gastos: 10000, nomina: 0, costo_financiero: 17600,
    neto_sala: 315200, faltante: 0,
  },
  {
    date: "2026-05-26", venta_total: 186000,
    estanco: 110000, cocteles: 76000, pizzeria: 0, otros_venta: 0,
    efectivo: 1000, tarjeta: 0, otros_pago: 185000,
    pizza_80: 0, gastos: 0, nomina: 185000, costo_financiero: 0,
    neto_sala: 1000, faltante: 0,
  },
  {
    date: "2026-05-27", venta_total: 361600,
    estanco: 15000, cocteles: 159000, pizzeria: 187600, otros_venta: 0,
    efectivo: 39400, tarjeta: 289600, otros_pago: 0,
    pizza_80: 150080, gastos: 32600, nomina: 0, costo_financiero: 14480,
    neto_sala: 164440, faltante: 0,
  },
  {
    date: "2026-05-28", venta_total: 1010800,
    estanco: 42000, cocteles: 595000, pizzeria: 373800, otros_venta: 0,
    efectivo: 46700, tarjeta: 479000, otros_pago: 0,
    pizza_80: 299040, gastos: 100100, nomina: 385000, costo_financiero: 23950,
    neto_sala: 202710, faltante: 0,
  },
  {
    date: "2026-05-29", venta_total: 4858000,
    estanco: 1042000, cocteles: 2620000, pizzeria: 1196000, otros_venta: 0,
    efectivo: 466350, tarjeta: 3897800, otros_pago: 0,
    pizza_80: 956800, gastos: 193850, nomina: 300000, costo_financiero: 194890,
    neto_sala: 3212460, faltante: 0,
  },
  {
    date: "2026-05-30", venta_total: 1221200,
    estanco: 399000, cocteles: 487000, pizzeria: 335200, otros_venta: 0,
    efectivo: 141500, tarjeta: 660000, otros_pago: 0,
    pizza_80: 268160, gastos: 159700, nomina: 260000, costo_financiero: 33000,
    neto_sala: 500340, faltante: 0,
  },
  {
    date: "2026-06-01", venta_total: 952000,
    estanco: 144000, cocteles: 208000, pizzeria: 600000, otros_venta: 0,
    efectivo: 3800, tarjeta: 937000, otros_pago: 0,
    pizza_80: 480000, gastos: 11200, nomina: 0, costo_financiero: 46850,
    neto_sala: 413950, faltante: 0,
  },
  {
    date: "2026-06-02", venta_total: 434400,
    estanco: 31000, cocteles: 134000, pizzeria: 269400, otros_venta: 0,
    efectivo: 13500, tarjeta: 388800, otros_pago: 0,
    pizza_80: 215520, gastos: 32100, nomina: 0, costo_financiero: 19440,
    neto_sala: 167340, faltante: 0,
  },
  {
    date: "2026-06-03", venta_total: 1448400,
    estanco: 533000, cocteles: 350000, pizzeria: 565400, otros_venta: 0,
    efectivo: 106000, tarjeta: 1337400, otros_pago: 0,
    pizza_80: 452320, gastos: 5000, nomina: 0, costo_financiero: 66870,
    neto_sala: 924210, faltante: 0,
  },
  {
    date: "2026-06-04", venta_total: 429200,
    estanco: 232000, cocteles: 118000, pizzeria: 79200, otros_venta: 0,
    efectivo: 91400, tarjeta: 243600, otros_pago: 0,
    pizza_80: 63360, gastos: 94200, nomina: 0, costo_financiero: 12180,
    neto_sala: 259460, faltante: 0,
  },
  {
    date: "2026-06-05", venta_total: 3012000,
    estanco: 1342000, cocteles: 655000, pizzeria: 1015000, otros_venta: 0,
    efectivo: 35600, tarjeta: 2586400, otros_pago: 0,
    pizza_80: 812000, gastos: 10000, nomina: 380000, costo_financiero: 129320,
    neto_sala: 1680680, faltante: 0,
  },
  {
    date: "2026-06-06", venta_total: 2444000,
    estanco: 704000, cocteles: 980000, pizzeria: 760000, otros_venta: 0,
    efectivo: 40800, tarjeta: 2048600, otros_pago: 0,
    pizza_80: 608000, gastos: 94600, nomina: 260000, costo_financiero: 102430,
    neto_sala: 1378970, faltante: 0,
  },
  {
    date: "2026-06-07", venta_total: 2124800,
    estanco: 445000, cocteles: 714000, pizzeria: 965800, otros_venta: 0,
    efectivo: 168600, tarjeta: 1751200, otros_pago: 0,
    pizza_80: 772640, gastos: 5000, nomina: 200000, costo_financiero: 87560,
    neto_sala: 1059600, faltante: 0,
  },
  {
    date: "2026-06-08", venta_total: 1156600,
    estanco: 37000, cocteles: 535000, pizzeria: 584600, otros_venta: 0,
    efectivo: 36600, tarjeta: 815000, otros_pago: 0,
    pizza_80: 467680, gastos: 105000, nomina: 200000, costo_financiero: 40750,
    neto_sala: 343170, faltante: 0,
  },
  {
    date: "2026-06-09", venta_total: 614200,
    estanco: 40000, cocteles: 213000, pizzeria: 361200, otros_venta: 0,
    efectivo: 99100, tarjeta: 310000, otros_pago: 0,
    pizza_80: 288960, gastos: 20100, nomina: 185000, costo_financiero: 15500,
    neto_sala: 104640, faltante: 0,
  },
  {
    date: "2026-06-10", venta_total: 2085600,
    estanco: 387000, cocteles: 1122000, pizzeria: 576600, otros_venta: 0,
    efectivo: 11730, tarjeta: 1684400, otros_pago: 0,
    pizza_80: 461280, gastos: 189470, nomina: 200000, costo_financiero: 84220,
    neto_sala: 1150630, faltante: 0,
  },
  {
    date: "2026-06-11", venta_total: 711600,
    estanco: 91000, cocteles: 383000, pizzeria: 189600, otros_venta: 48000,
    efectivo: 10300, tarjeta: 660800, otros_pago: 0,
    pizza_80: 151680, gastos: 40500, nomina: 0, costo_financiero: 33040,
    neto_sala: 486380, faltante: 0,
  },
  {
    date: "2026-06-12", venta_total: 1474200,
    estanco: 325000, cocteles: 488000, pizzeria: 661200, otros_venta: 0,
    efectivo: 700, tarjeta: 1179200, otros_pago: 0,
    pizza_80: 528960, gastos: 34300, nomina: 260000, costo_financiero: 58960,
    neto_sala: 591980, faltante: 0,
  },
  {
    date: "2026-06-13", venta_total: 1997800,
    estanco: 55000, cocteles: 1008000, pizzeria: 934800, otros_venta: 0,
    efectivo: 161200, tarjeta: 1285000, otros_pago: 0,
    pizza_80: 747840, gastos: 106600, nomina: 445000, costo_financiero: 64250,
    neto_sala: 634110, faltante: 0,
  },
  {
    date: "2026-06-14", venta_total: 2912200,
    estanco: 626000, cocteles: 1444000, pizzeria: 842200, otros_venta: 0,
    efectivo: 817480, tarjeta: 1805200, otros_pago: 0,
    pizza_80: 673760, gastos: 89520, nomina: 200000, costo_financiero: 90260,
    neto_sala: 1858660, faltante: 0,
  },
  {
    date: "2026-06-15", venta_total: 662800,
    estanco: 42000, cocteles: 549000, pizzeria: 71800, otros_venta: 0,
    efectivo: 28400, tarjeta: 555800, otros_pago: 0,
    pizza_80: 57440, gastos: 78600, nomina: 0, costo_financiero: 27790,
    neto_sala: 498970, faltante: 0,
  },
  {
    date: "2026-06-16", venta_total: 903200,
    estanco: 160000, cocteles: 278000, pizzeria: 465200, otros_venta: 0,
    efectivo: 228800, tarjeta: 554400, otros_pago: 0,
    pizza_80: 372160, gastos: 120000, nomina: 0, costo_financiero: 27720,
    neto_sala: 383320, faltante: 0,
  },
  {
    date: "2026-06-17", venta_total: 2883000,
    estanco: 696000, cocteles: 520000, pizzeria: 1667000, otros_venta: 0,
    efectivo: 598700, tarjeta: 1442600, otros_pago: 0,
    pizza_80: 1333600, gastos: 506700, nomina: 335000, costo_financiero: 72130,
    neto_sala: 635570, faltante: 0,
  },
  {
    date: "2026-06-18", venta_total: 807600,
    estanco: 99000, cocteles: 338000, pizzeria: 370600, otros_venta: 0,
    efectivo: 251400, tarjeta: 366200, otros_pago: 0,
    pizza_80: 296480, gastos: 5000, nomina: 185000, costo_financiero: 18310,
    neto_sala: 302810, faltante: 0,
  },
  {
    date: "2026-06-19", venta_total: 1560400,
    estanco: 165000, cocteles: 671000, pizzeria: 689400, otros_venta: 35000,
    efectivo: 2800, tarjeta: 1287600, otros_pago: 0,
    pizza_80: 551520, gastos: 10000, nomina: 260000, costo_financiero: 64380,
    neto_sala: 674500, faltante: 0,
  },
  {
    date: "2026-06-20", venta_total: 1562400,
    estanco: 164000, cocteles: 424000, pizzeria: 974400, otros_venta: 0,
    efectivo: 204600, tarjeta: 482200, otros_pago: 0,
    pizza_80: 779520, gastos: 615600, nomina: 260000, costo_financiero: 24110,
    neto_sala: -116830, faltante: 0,
  },
  {
    date: "2026-06-22", venta_total: 1137800,
    estanco: 324000, cocteles: 217000, pizzeria: 596800, otros_venta: 0,
    efectivo: 59160, tarjeta: 1002400, otros_pago: 0,
    pizza_80: 477440, gastos: 6240, nomina: 70000, costo_financiero: 50120,
    neto_sala: 534000, faltante: 0,
  },
  {
    date: "2026-06-23", venta_total: 2526600,
    estanco: 968000, cocteles: 506000, pizzeria: 1052600, otros_venta: 0,
    efectivo: 32480, tarjeta: 1943800, otros_pago: 0,
    pizza_80: 842080, gastos: 150320, nomina: 400000, costo_financiero: 97190,
    neto_sala: 1037010, faltante: 0,
  },
  {
    date: "2026-06-24", venta_total: 461400,
    estanco: 34000, cocteles: 239000, pizzeria: 188400, otros_venta: 0,
    efectivo: 14200, tarjeta: 0, otros_pago: 0,
    pizza_80: 150720, gastos: 262200, nomina: 185000, costo_financiero: 0,
    neto_sala: -136520, faltante: 0,
  },
  {
    date: "2026-06-25", venta_total: 379600,
    estanco: 90000, cocteles: 196000, pizzeria: 93600, otros_venta: 0,
    efectivo: 1000, tarjeta: 373600, otros_pago: 0,
    pizza_80: 74880, gastos: 5000, nomina: 0, costo_financiero: 18680,
    neto_sala: 281040, faltante: 0,
  },
  {
    date: "2026-06-26", venta_total: 950200,
    estanco: 245000, cocteles: 365000, pizzeria: 340200, otros_venta: 0,
    efectivo: 8800, tarjeta: 486400, otros_pago: 0,
    pizza_80: 272160, gastos: 10000, nomina: 445000, costo_financiero: 24320,
    neto_sala: 198720, faltante: 0,
  },
  {
    date: "2026-06-27", venta_total: 2616000,
    estanco: 1268000, cocteles: 682000, pizzeria: 666000, otros_venta: 0,
    efectivo: 8000, tarjeta: 2268000, otros_pago: 0,
    pizza_80: 532800, gastos: 10000, nomina: 330000, costo_financiero: 113400,
    neto_sala: 1629800, faltante: 0,
  },
  {
    date: "2026-06-28", venta_total: 418600,
    estanco: 39000, cocteles: 207000, pizzeria: 172600, otros_venta: 0,
    efectivo: 53200, tarjeta: 294200, otros_pago: 0,
    pizza_80: 138080, gastos: 6200, nomina: 65000, costo_financiero: 14710,
    neto_sala: 194610, faltante: 0,
  },
  {
    date: "2026-06-29", venta_total: 371000,
    estanco: 90000, cocteles: 13000, pizzeria: 268000, otros_venta: 0,
    efectivo: 3400, tarjeta: 96600, otros_pago: 0,
    pizza_80: 214400, gastos: 86000, nomina: 185000, costo_financiero: 4830,
    neto_sala: -119230, faltante: 0,
  },
  {
    date: "2026-06-30", venta_total: 368000,
    estanco: 99000, cocteles: 56000, pizzeria: 213000, otros_venta: 0,
    efectivo: 800, tarjeta: 114600, otros_pago: 0,
    pizza_80: 170400, gastos: 67600, nomina: 185000, costo_financiero: 5730,
    neto_sala: -60730, faltante: 0,
  },
  {
    date: "2026-07-01", venta_total: 1005800,
    estanco: 614000, cocteles: 144000, pizzeria: 247800, otros_venta: 0,
    efectivo: 16700, tarjeta: 717600, otros_pago: 0,
    pizza_80: 198240, gastos: 71500, nomina: 200000, costo_financiero: 35880,
    neto_sala: 500180, faltante: 0,
  },
  {
    date: "2026-07-02", venta_total: 1310400,
    estanco: 579000, cocteles: 272000, pizzeria: 459400, otros_venta: 0,
    efectivo: 608600, tarjeta: 433200, otros_pago: 0,
    pizza_80: 367520, gastos: 68600, nomina: 200000, costo_financiero: 21660,
    neto_sala: 652620, faltante: 0,
  },
  {
    date: "2026-07-03", venta_total: 2715400,
    estanco: 903000, cocteles: 565000, pizzeria: 1247400, otros_venta: 0,
    efectivo: 132700, tarjeta: 2146800, otros_pago: 0,
    pizza_80: 997920, gastos: 105900, nomina: 330000, costo_financiero: 107340,
    neto_sala: 1174240, faltante: 0,
  },
  {
    date: "2026-07-04", venta_total: 1145600,
    estanco: 125000, cocteles: 429000, pizzeria: 591600, otros_venta: 0,
    efectivo: 114600, tarjeta: 761000, otros_pago: 0,
    pizza_80: 473280, gastos: 10000, nomina: 260000, costo_financiero: 38050,
    neto_sala: 364270, faltante: 0,
  },
  {
    date: "2026-07-05", venta_total: 151000,
    estanco: 21000, cocteles: 19000, pizzeria: 111000, otros_venta: 0,
    efectivo: 19000, tarjeta: 0, otros_pago: 0,
    pizza_80: 88800, gastos: 12000, nomina: 120000, costo_financiero: 0,
    neto_sala: -69800, faltante: 0,
  },
  {
    date: "2026-07-06", venta_total: 586000,
    estanco: 99000, cocteles: 421000, pizzeria: 66000, otros_venta: 0,
    efectivo: 26600, tarjeta: 489400, otros_pago: 0,
    pizza_80: 52800, gastos: 5000, nomina: 65000, costo_financiero: 24470,
    neto_sala: 438730, faltante: 0,
  },
  {
    date: "2026-07-07", venta_total: 2791800,
    estanco: 1811000, cocteles: 292000, pizzeria: 688800, otros_venta: 0,
    efectivo: 494350, tarjeta: 1492800, otros_pago: 0,
    pizza_80: 551040, gastos: 69650, nomina: 735000, costo_financiero: 74640,
    neto_sala: 1361470, faltante: 0,
  },
  {
    date: "2026-07-08", venta_total: 335400,
    estanco: 184000, cocteles: 10000, pizzeria: 141400, otros_venta: 0,
    efectivo: 27000, tarjeta: 118400, otros_pago: 0,
    pizza_80: 113120, gastos: 5000, nomina: 185000, costo_financiero: 5920,
    neto_sala: 26360, faltante: 0,
  },
  {
    date: "2026-07-09", venta_total: 74600,
    estanco: 31000, cocteles: 4000, pizzeria: 39600, otros_venta: 0,
    efectivo: 4600, tarjeta: 0, otros_pago: 0,
    pizza_80: 31680, gastos: 5000, nomina: 65000, costo_financiero: 0,
    neto_sala: -27080, faltante: 0,
  },
  {
    date: "2026-07-10", venta_total: 1581200,
    estanco: 259000, cocteles: 372000, pizzeria: 950200, otros_venta: 0,
    efectivo: 45800, tarjeta: 1265400, otros_pago: 0,
    pizza_80: 760160, gastos: 10000, nomina: 260000, costo_financiero: 63270,
    neto_sala: 487770, faltante: 0,
  },
  {
    date: "2026-07-11", venta_total: 1053800,
    estanco: 262000, cocteles: 407000, pizzeria: 384800, otros_venta: 0,
    efectivo: 1850, tarjeta: 708200, otros_pago: 0,
    pizza_80: 307840, gastos: 83750, nomina: 260000, costo_financiero: 35410,
    neto_sala: 366800, faltante: 0,
  },
  {
    date: "2026-07-12", venta_total: 1390000,
    estanco: 104000, cocteles: 844000, pizzeria: 442000, otros_venta: 0,
    efectivo: 52000, tarjeta: 1263000, otros_pago: 0,
    pizza_80: 353600, gastos: 5000, nomina: 70000, costo_financiero: 63150,
    neto_sala: 898250, faltante: 0,
  },
  {
    date: "2026-07-13", venta_total: 424400,
    estanco: 26000, cocteles: 60000, pizzeria: 338400, otros_venta: 0,
    efectivo: 5400, tarjeta: 216000, otros_pago: 0,
    pizza_80: 270720, gastos: 78000, nomina: 125000, costo_financiero: 10800,
    neto_sala: -60120, faltante: 0,
  },
  {
    date: "2026-07-14", venta_total: 595200,
    estanco: 40000, cocteles: 427000, pizzeria: 128200, otros_venta: 0,
    efectivo: 12000, tarjeta: 393200, otros_pago: 0,
    pizza_80: 102560, gastos: 5000, nomina: 185000, costo_financiero: 19660,
    neto_sala: 282980, faltante: 0,
  },
  {
    date: "2026-07-15", venta_total: 315600,
    estanco: 43000, cocteles: 78000, pizzeria: 194600, otros_venta: 0,
    efectivo: 9800, tarjeta: 136800, otros_pago: 0,
    pizza_80: 155680, gastos: 44000, nomina: 125000, costo_financiero: 6840,
    neto_sala: -15920, faltante: 0,
  },
  {
    date: "2026-07-16", venta_total: 477800,
    estanco: 53000, cocteles: 174000, pizzeria: 250800, otros_venta: 0,
    efectivo: 2000, tarjeta: 444800, otros_pago: 0,
    pizza_80: 200640, gastos: 31000, nomina: 0, costo_financiero: 22240,
    neto_sala: 223920, faltante: 0,
  },
  {
    date: "2026-07-17", venta_total: 2522800,
    estanco: 566000, cocteles: 1212000, pizzeria: 744800, otros_venta: 0,
    efectivo: 700, tarjeta: 2179600, otros_pago: 0,
    pizza_80: 595840, gastos: 10000, nomina: 332500, costo_financiero: 108980,
    neto_sala: 1475480, faltante: 0,
  },
  {
    date: "2026-07-18", venta_total: 2394800,
    estanco: 580000, cocteles: 1250000, pizzeria: 550800, otros_venta: 14000,
    efectivo: 22750, tarjeta: 2210800, otros_pago: 0,
    pizza_80: 440640, gastos: 161250, nomina: 0, costo_financiero: 110540,
    neto_sala: 1682370, faltante: 0,
  },
  {
    date: "2026-07-19", venta_total: 1095200,
    estanco: 86000, cocteles: 404000, pizzeria: 605200, otros_venta: 0,
    efectivo: 41800, tarjeta: 848400, otros_pago: 0,
    pizza_80: 484160, gastos: 5000, nomina: 200000, costo_financiero: 42420,
    neto_sala: 363620, faltante: 0,
  },
  {
    date: "2026-07-20", venta_total: 797200,
    estanco: 118000, cocteles: 363000, pizzeria: 316200, otros_venta: 0,
    efectivo: 650, tarjeta: 431800, otros_pago: 0,
    pizza_80: 252960, gastos: 179750, nomina: 185000, costo_financiero: 21590,
    neto_sala: 157900, faltante: 0,
  },
  {
    date: "2026-07-21", venta_total: 1419200,
    estanco: 806000, cocteles: 275000, pizzeria: 338200, otros_venta: 0,
    efectivo: 8640, tarjeta: 1379200, otros_pago: 0,
    pizza_80: 270560, gastos: 31360, nomina: 0, costo_financiero: 68960,
    neto_sala: 1048320, faltante: 0,
  },
  {
    date: "2026-07-22", venta_total: 923800,
    estanco: 132000, cocteles: 256000, pizzeria: 535800, otros_venta: 0,
    efectivo: 14000, tarjeta: 904800, otros_pago: 0,
    pizza_80: 428640, gastos: 5000, nomina: 0, costo_financiero: 45240,
    neto_sala: 444920, faltante: 0,
  },
  {
    date: "2026-07-23", venta_total: 493200,
    estanco: 35000, cocteles: 338000, pizzeria: 120200, otros_venta: 0,
    efectivo: 15000, tarjeta: 473200, otros_pago: 0,
    pizza_80: 96160, gastos: 5000, nomina: 0, costo_financiero: 23660,
    neto_sala: 368380, faltante: 0,
  },
  {
    date: "2026-07-24", venta_total: 1463400,
    estanco: 586000, cocteles: 423000, pizzeria: 454400, otros_venta: 0,
    efectivo: 5540, tarjeta: 1083600, otros_pago: 0,
    pizza_80: 363520, gastos: 114260, nomina: 260000, costo_financiero: 54180,
    neto_sala: 671440, faltante: 0,
  },
  {
    date: "2026-07-25", venta_total: 2315400,
    estanco: 464000, cocteles: 802000, pizzeria: 1049400, otros_venta: 0,
    efectivo: 21380, tarjeta: 1998400, otros_pago: 0,
    pizza_80: 839520, gastos: 98120, nomina: 197500, costo_financiero: 99920,
    neto_sala: 1080340, faltante: 0,
  },
  {
    date: "2026-07-26", venta_total: 266200,
    estanco: 12000, cocteles: 169000, pizzeria: 85200, otros_venta: 0,
    efectivo: 1350, tarjeta: 224200, otros_pago: 0,
    pizza_80: 68160, gastos: 40650, nomina: 0, costo_financiero: 11210,
    neto_sala: 146180, faltante: 0,
  },
  {
    date: "2026-07-27", venta_total: 217800,
    estanco: 40000, cocteles: 149000, pizzeria: 28800, otros_venta: 0,
    efectivo: 35550, tarjeta: 0, otros_pago: 0,
    pizza_80: 23040, gastos: 57250, nomina: 125000, costo_financiero: 0,
    neto_sala: 12510, faltante: 0,
  },
  {
    date: "2026-07-28", venta_total: 277800,
    estanco: 21000, cocteles: 185000, pizzeria: 71800, otros_venta: 0,
    efectivo: 9520, tarjeta: 187800, otros_pago: 0,
    pizza_80: 57440, gastos: 20480, nomina: 60000, costo_financiero: 9390,
    neto_sala: 130490, faltante: 0,
  },
  {
    date: "2026-07-29", venta_total: 874400,
    estanco: 233000, cocteles: 449000, pizzeria: 192400, otros_venta: 0,
    efectivo: 28160, tarjeta: 825400, otros_pago: 0,
    pizza_80: 153920, gastos: 20840, nomina: 0, costo_financiero: 41270,
    neto_sala: 658370, faltante: 0,
  },
  {
    date: "2026-07-30", venta_total: 568200,
    estanco: 82000, cocteles: 265000, pizzeria: 221200, otros_venta: 0,
    efectivo: 5000, tarjeta: 407200, otros_pago: 0,
    pizza_80: 176960, gastos: 31000, nomina: 125000, costo_financiero: 20360,
    neto_sala: 214880, faltante: 0,
  },
  {
    date: "2026-07-31", venta_total: 2534800,
    estanco: 623000, cocteles: 1014000, pizzeria: 881800, otros_venta: 16000,
    efectivo: 47900, tarjeta: 1697400, otros_pago: 0,
    pizza_80: 705440, gastos: 592000, nomina: 197500, costo_financiero: 84870,
    neto_sala: 954990, faltante: 0,
  },
  {
    date: "2026-08-01", venta_total: 1074000,
    estanco: 120000, cocteles: 538000, pizzeria: 416000, otros_venta: 0,
    efectivo: 24500, tarjeta: 773000, otros_pago: 0,
    pizza_80: 332800, gastos: 79000, nomina: 197500, costo_financiero: 38650,
    neto_sala: 426050, faltante: 0,
  },
  {
    date: "2026-08-02", venta_total: 506800,
    estanco: 301000, cocteles: 0, pizzeria: 205800, otros_venta: 0,
    efectivo: 49050, tarjeta: 343800, otros_pago: 0,
    pizza_80: 164640, gastos: 113950, nomina: 0, costo_financiero: 17190,
    neto_sala: 211020, faltante: 0,
  },
  {
    date: "2026-08-03", venta_total: 162600,
    estanco: 24000, cocteles: 0, pizzeria: 138600, otros_venta: 0,
    efectivo: 2600, tarjeta: 0, otros_pago: 0,
    pizza_80: 110880, gastos: 160000, nomina: 0, costo_financiero: 0,
    neto_sala: -108280, faltante: 0,
  },
  {
    date: "2026-08-04", venta_total: 1134600,
    estanco: 129000, cocteles: 616000, pizzeria: 389600, otros_venta: 0,
    efectivo: 59800, tarjeta: 921400, otros_pago: 0,
    pizza_80: 311680, gastos: 138400, nomina: 15000, costo_financiero: 46070,
    neto_sala: 623450, faltante: 0,
  },
  {
    date: "2026-08-05", venta_total: 598600,
    estanco: 27000, cocteles: 287000, pizzeria: 284600, otros_venta: 0,
    efectivo: 15200, tarjeta: 393400, otros_pago: 0,
    pizza_80: 227680, gastos: 5000, nomina: 185000, costo_financiero: 19670,
    neto_sala: 161250, faltante: 0,
  },
  {
    date: "2026-08-06", venta_total: 2107600,
    estanco: 536000, cocteles: 371000, pizzeria: 1200600, otros_venta: 0,
    efectivo: 3300, tarjeta: 1788000, otros_pago: 0,
    pizza_80: 960480, gastos: 116300, nomina: 200000, costo_financiero: 89400,
    neto_sala: 741420, faltante: 0,
  },
  {
    date: "2026-08-07", venta_total: 478400,
    estanco: 162000, cocteles: 24000, pizzeria: 292400, otros_venta: 0,
    efectivo: 0, tarjeta: 408400, otros_pago: 0,
    pizza_80: 233920, gastos: 31400, nomina: 38600, costo_financiero: 20420,
    neto_sala: 154060, faltante: 0,
  },
  {
    date: "2026-08-08", venta_total: 2755600,
    estanco: 973000, cocteles: 1017000, pizzeria: 765600, otros_venta: 0,
    efectivo: 465520, tarjeta: 1656000, otros_pago: 0,
    pizza_80: 612480, gastos: 436580, nomina: 197500, costo_financiero: 82800,
    neto_sala: 1426240, faltante: 0,
  }
];

const PRELOADED_COCINA = [
  {
    date: "2026-04-01", total: 789400, total_units: 26,
    productos: [
      { nombre: "HB DE POLLO", cantidad: 5, valor: 185000 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 5, valor: 66000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 3, valor: 95400 },
      { nombre: "PZ AB CARNES PEQ", cantidad: 2, valor: 79200 },
      { nombre: "PT AL CAMPO JR", cantidad: 2, valor: 64800 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ ESPANOLA MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "PZ CARNAVAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ POTOTO PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "ENSALADA GRANJERA", cantidad: 1, valor: 36000 },
    ]
  },
  {
    date: "2026-04-02", total: 831600, total_units: 23,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 4, valor: 127200 },
      { nombre: "LASAGNA MIXTA", cantidad: 2, valor: 86000 },
      { nombre: "PZ AB ESPECIAL GR", cantidad: 2, valor: 134400 },
      { nombre: "PT ALFREDO RG", cantidad: 2, valor: 76800 },
      { nombre: "PT CARBONARA RG", cantidad: 2, valor: 76800 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 2, valor: 22000 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "PT AL CAMPO RG", cantidad: 1, valor: 40200 },
      { nombre: "PZ POTOTO PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ MARGARITA MED", cantidad: 1, valor: 36000 },
      { nombre: "LASAGNA VEGETARIANA", cantidad: 1, valor: 36000 },
      { nombre: "PZ HONGOS Y HUERTOS PQ", cantidad: 1, valor: 32400 },
      { nombre: "NACHOS CLASICOS", cantidad: 1, valor: 31800 },
      { nombre: "PT BOLOGNESA RG", cantidad: 1, valor: 38400 },
    ]
  },
  {
    date: "2026-04-03", total: 813200, total_units: 24,
    productos: [
      { nombre: "PT CARBONARA RG", cantidad: 2, valor: 76800 },
      { nombre: "PZ AB ESPECIAL MED", cantidad: 2, valor: 108000 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 3, valor: 33000 },
      { nombre: "PZ DE LA CASA GR", cantidad: 1, valor: 66000 },
      { nombre: "PZ AB CARNES GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ AB CARNES PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ POTOTO MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ MARGARITA PQ", cantidad: 1, valor: 30000 },
      { nombre: "PZ CARNAVAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "PT ALFREDO RG", cantidad: 1, valor: 38400 },
      { nombre: "PT BOLOGNESA RG", cantidad: 1, valor: 38400 },
      { nombre: "PT POLLO BECHAMEL JR", cantidad: 1, valor: 31200 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "ENSALADA GRANJERA", cantidad: 1, valor: 36000 },
      { nombre: "ENSALADA MEDITERRANEA", cantidad: 1, valor: 34000 },
      { nombre: "NACHOS CLASICOS", cantidad: 1, valor: 31800 },
    ]
  },
  {
    date: "2026-04-04", total: 397200, total_units: 13,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 4, valor: 127200 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 4, valor: 44000 },
      { nombre: "PZ POLLO BBQ GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ POLLO CHAMPI MED", cantidad: 1, valor: 54000 },
      { nombre: "PT AL CAMPO RG", cantidad: 1, valor: 40200 },
      { nombre: "PZ MEXICANA PEQ", cantidad: 1, valor: 39600 },
      { nombre: "ENSALADA GRANJERA", cantidad: 1, valor: 36000 },
    ]
  },
  {
    date: "2026-04-05", total: 120000, total_units: 2,
    productos: [
      { nombre: "PZ AB CARNES GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ HAWAIANA MED", cantidad: 1, valor: 52800 },
    ]
  },
  {
    date: "2026-04-06", total: 932400, total_units: 18,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 6, valor: 190800 },
      { nombre: "PZ AB CARNES GR", cantidad: 2, valor: 134400 },
      { nombre: "PZ POTOTO GR", cantidad: 2, valor: 134400 },
      { nombre: "PZ CARNAVAL ESP GR", cantidad: 2, valor: 134400 },
      { nombre: "PZ HAWAIANA GR", cantidad: 2, valor: 132000 },
      { nombre: "PZ MEXICANA GR", cantidad: 2, valor: 134400 },
      { nombre: "NACHOS CON CHILI", cantidad: 1, valor: 36000 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
    ]
  },
  {
    date: "2026-04-18", total: 1055400, total_units: 34,
    productos: [
      { nombre: "PZ PTLN 2 INGR JR", cantidad: 31, valor: 1004400 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
      { nombre: "ADICION COMIDA", cantidad: 1, valor: 4000 },
    ]
  },
  {
    date: "2026-04-19", total: 99000, total_units: 3,
    productos: [
      { nombre: "PZ AB ESPECIAL MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-04-20", total: 73000, total_units: 2,
    productos: [
      { nombre: "HB DE POLLO", cantidad: 1, valor: 37000 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
    ]
  },
  {
    date: "2026-04-21", total: 184600, total_units: 4,
    productos: [
      { nombre: "PZ PEPERNATA GR", cantidad: 1, valor: 66000 },
      { nombre: "PZ PEPERNATA MED", cantidad: 1, valor: 52800 },
      { nombre: "ENSALADA MEDITERRANEA", cantidad: 1, valor: 34000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
    ]
  },
  {
    date: "2026-04-23", total: 309600, total_units: 8,
    productos: [
      { nombre: "LASAGNA MIXTA", cantidad: 2, valor: 86000 },
      { nombre: "LASAGNA DE POLLO", cantidad: 2, valor: 80000 },
      { nombre: "PT ALFREDO RG", cantidad: 1, valor: 38400 },
      { nombre: "PT BOLOGNESA RG", cantidad: 1, valor: 38400 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
    ]
  },
  {
    date: "2026-04-24", total: 242800, total_units: 7,
    productos: [
      { nombre: "HB DE POLLO", cantidad: 2, valor: 74000 },
      { nombre: "LASAGNA MIXTA", cantidad: 2, valor: 86000 },
      { nombre: "LASAGNA DE RES", cantidad: 1, valor: 40000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
    ]
  },
  {
    date: "2026-04-25", total: 352400, total_units: 10,
    productos: [
      { nombre: "PZ DE LA GRANJA PEQ", cantidad: 2, valor: 64800 },
      { nombre: "LASAGNA MIXTA", cantidad: 2, valor: 86000 },
      { nombre: "PZ PEPERNATA GR", cantidad: 1, valor: 66000 },
      { nombre: "PZ PEPERNATA MED", cantidad: 1, valor: 52800 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
      { nombre: "ADICION COMIDA", cantidad: 1, valor: 4000 },
    ]
  },
  {
    date: "2026-04-26", total: 220600, total_units: 7,
    productos: [
      { nombre: "PZ AB CARNES GR", cantidad: 1, valor: 67200 },
      { nombre: "ALITAS PICANTES BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "PZ AB ESPECIAL MED", cantidad: 1, valor: 54000 },
      { nombre: "NACHOS CLASICOS", cantidad: 1, valor: 31800 },
      { nombre: "EMPAQUE", cantidad: 2, valor: 4000 },
    ]
  },
  {
    date: "2026-04-27", total: 49400, total_units: 2,
    productos: [
      { nombre: "PZ HAWAIANA PEQ", cantidad: 1, valor: 38400 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
    ]
  },
  {
    date: "2026-04-28", total: 377600, total_units: 7,
    productos: [
      { nombre: "PZ AB ESPECIAL GR", cantidad: 2, valor: 134400 },
      { nombre: "PZ AB CARNES GR", cantidad: 2, valor: 134400 },
      { nombre: "PZ AB ESPECIAL MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ HAWAIANA MED", cantidad: 1, valor: 52800 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-04-29", total: 302600, total_units: 9,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 3, valor: 95400 },
      { nombre: "LASAGNA DE RES", cantidad: 1, valor: 40000 },
      { nombre: "PT CARBONARA RG", cantidad: 1, valor: 38400 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "LASAGNA VEGETARIANA", cantidad: 1, valor: 36000 },
      { nombre: "NACHOS CLASICOS", cantidad: 1, valor: 31800 },
      { nombre: "FOCACCIA", cantidad: 1, valor: 14000 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
    ]
  },
  {
    date: "2026-04-30", total: 1214200, total_units: 32,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 5, valor: 159000 },
      { nombre: "PZ AB CARNES GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ CARNAVAL MED", cantidad: 2, valor: 108000 },
      { nombre: "PZ HAWAIANA MED", cantidad: 2, valor: 105600 },
      { nombre: "PT AL CAMPO RG", cantidad: 2, valor: 80400 },
      { nombre: "HB HAWAIANA", cantidad: 2, valor: 74000 },
      { nombre: "HB DE POLLO", cantidad: 2, valor: 74000 },
      { nombre: "HB DE RES CON CHAMPI", cantidad: 1, valor: 54000 },
      { nombre: "PZ AB ESPECIAL MED", cantidad: 1, valor: 54000 },
      { nombre: "PT POLLO BECHAMEL RG", cantidad: 1, valor: 52800 },
      { nombre: "PZ AB CARNES PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ MEXICANA PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ TOCINETA HIGOS PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ FLORENTINA PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PT POLLO BECHAMEL JR", cantidad: 1, valor: 31200 },
      { nombre: "PT CARBONARA JR", cantidad: 1, valor: 31200 },
      { nombre: "PT AL CAMPO JR", cantidad: 1, valor: 32400 },
      { nombre: "ENSALADA GRANJERA", cantidad: 1, valor: 36000 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "PZ POTOTO PEQ", cantidad: 1, valor: 39600 },
      { nombre: "CHAMPINONES PARMESANOS", cantidad: 1, valor: 28600 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 2, valor: 22000 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-05-01", total: 905200, total_units: 23,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 4, valor: 127200 },
      { nombre: "HB DE RES", cantidad: 4, valor: 140000 },
      { nombre: "PZ AB ESPECIAL MED", cantidad: 2, valor: 108000 },
      { nombre: "PZ HAWAIANA MED", cantidad: 2, valor: 105600 },
      { nombre: "PZ AB CARNES PEQ", cantidad: 2, valor: 79200 },
      { nombre: "PZ AB ESPECIAL GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ FLORENTINA MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ POLLO BBQ PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ POTOTO PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ PEPERNATA PEQ", cantidad: 1, valor: 38400 },
      { nombre: "PT POLLO BECHAMEL RG", cantidad: 1, valor: 38400 },
      { nombre: "HB BBQ", cantidad: 1, valor: 30000 },
      { nombre: "PZ MARGARITA PQ", cantidad: 1, valor: 30000 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-05-02", total: 398000, total_units: 11,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "PZ AB ESPECIAL MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ POLLO CHAMPI MED", cantidad: 1, valor: 54000 },
      { nombre: "NACHOS ESPECIALES", cantidad: 2, valor: 72000 },
      { nombre: "PT CARBONARA RG", cantidad: 1, valor: 38400 },
      { nombre: "PZ POTOTO PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ NAPOLITANA MED", cantidad: 1, valor: 33600 },
      { nombre: "NACHOS CLASICOS", cantidad: 1, valor: 31800 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
    ]
  },
  {
    date: "2026-05-03", total: 41600, total_units: 2,
    productos: [
      { nombre: "PZ AB CARNES PEQ", cantidad: 1, valor: 39600 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-05-04", total: 37000, total_units: 1,
    productos: [
      { nombre: "HB DE POLLO", cantidad: 1, valor: 37000 },
    ]
  },
  {
    date: "2026-05-05", total: 78000, total_units: 2,
    productos: [
      { nombre: "PT CARBONARA RG", cantidad: 1, valor: 38400 },
      { nombre: "PZ MEXICANA PEQ", cantidad: 1, valor: 39600 },
    ]
  },
  {
    date: "2026-05-06", total: 386400, total_units: 13,
    productos: [
      { nombre: "PZ AB CARNES GR", cantidad: 1, valor: 67200 },
      { nombre: "ALITAS PICANTES BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "PZ POLLO CHAMPI MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "HB DE POLLO", cantidad: 1, valor: 37000 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 4, valor: 44000 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-05-07", total: 647800, total_units: 17,
    productos: [
      { nombre: "PZ FLORENTINA GR", cantidad: 1, valor: 67200 },
      { nombre: "LASAGNA MIXTA", cantidad: 3, valor: 129000 },
      { nombre: "PZ PEPERNATA MED", cantidad: 1, valor: 52800 },
      { nombre: "LASAGNA DE POLLO", cantidad: 1, valor: 40000 },
      { nombre: "PT ALFREDO RG", cantidad: 1, valor: 38400 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
      { nombre: "HB BBQ", cantidad: 1, valor: 36000 },
      { nombre: "HB DE RES CON CHAMPI", cantidad: 1, valor: 36000 },
      { nombre: "ENSALADA GRANJERA", cantidad: 1, valor: 36000 },
      { nombre: "NACHOS ESPECIALES", cantidad: 2, valor: 72000 },
      { nombre: "CHAMPINONES PARMESANOS", cantidad: 1, valor: 28800 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-05-08", total: 540600, total_units: 14,
    productos: [
      { nombre: "PZ AB CARNES MED", cantidad: 2, valor: 108000 },
      { nombre: "PZ POLLO CHAMPI MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ CARNAVAL MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA MIXTA", cantidad: 2, valor: 86000 },
      { nombre: "LASAGNA DE POLLO", cantidad: 2, valor: 80000 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
      { nombre: "HB DE POLLO", cantidad: 1, valor: 37000 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "PZ AB CARNES PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
    ]
  },
  {
    date: "2026-05-09", total: 1488000, total_units: 33,
    productos: [
      { nombre: "LASAGNA MIXTA", cantidad: 6, valor: 258000 },
      { nombre: "LASAGNA DE POLLO", cantidad: 4, valor: 160000 },
      { nombre: "PZ AB CARNES GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ HAWAIANA GR", cantidad: 1, valor: 66000 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ AB ESPECIAL MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ CARNAVAL ESP MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ PEPERNATA MED", cantidad: 1, valor: 52800 },
      { nombre: "LASAGNA DE RES", cantidad: 1, valor: 40000 },
      { nombre: "PZ CARNAVAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ POLLO BBQ PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PT BOLOGNESA RG", cantidad: 2, valor: 76800 },
      { nombre: "PT CARBONARA RG", cantidad: 2, valor: 76800 },
      { nombre: "PT POLLO BECHAMEL RG", cantidad: 1, valor: 38400 },
      { nombre: "PT CARBONARA JR", cantidad: 1, valor: 31200 },
      { nombre: "PT ALFREDO JR", cantidad: 1, valor: 31200 },
      { nombre: "HB DE POLLO", cantidad: 1, valor: 37000 },
      { nombre: "HB BBQ", cantidad: 1, valor: 36000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "NACHOS ESPECIALES", cantidad: 2, valor: 72000 },
      { nombre: "NACHOS CON CHILI", cantidad: 1, valor: 36000 },
      { nombre: "NACHOS CLASICOS", cantidad: 1, valor: 31800 },
      { nombre: "PZ MARGARITA MED", cantidad: 1, valor: 36000 },
      { nombre: "LASAGNA VEGETARIANA", cantidad: 1, valor: 36000 },
    ]
  },
  {
    date: "2026-05-10", total: 525200, total_units: 14,
    productos: [
      { nombre: "PZ POLLO CHAMPI GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ FLORENTINA GR", cantidad: 1, valor: 67200 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "PZ PTLN 3 INGR RG", cantidad: 1, valor: 42000 },
      { nombre: "LASAGNA DE POLLO", cantidad: 1, valor: 40000 },
      { nombre: "LASAGNA MIXTA", cantidad: 2, valor: 86000 },
      { nombre: "PZ AB CARNES PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PT CARBONARA RG", cantidad: 1, valor: 38400 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "PT BOLOGNESA JR", cantidad: 1, valor: 31200 },
      { nombre: "FOCACCIA", cantidad: 1, valor: 14000 },
    ]
  },
  {
    date: "2026-05-11", total: 207400, total_units: 7,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 3, valor: 95400 },
      { nombre: "PZ CARNAVAL MED", cantidad: 1, valor: 54000 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 2, valor: 22000 },
    ]
  },
  {
    date: "2026-05-12", total: 604000, total_units: 18,
    productos: [
      { nombre: "HB MEXICANA", cantidad: 2, valor: 74000 },
      { nombre: "HB HAWAIANA", cantidad: 2, valor: 74000 },
      { nombre: "HB BBQ", cantidad: 2, valor: 72000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "PZ AB ESPECIAL MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "LASAGNA DE POLLO", cantidad: 1, valor: 40000 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "NACHOS CON CHILI", cantidad: 1, valor: 36000 },
      { nombre: "ENSALADA GRANJERA", cantidad: 1, valor: 36000 },
      { nombre: "PT POLLO BECHAMEL JR", cantidad: 1, valor: 31200 },
      { nombre: "PT CARBONARA JR", cantidad: 1, valor: 31200 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-05-13", total: 392200, total_units: 10,
    productos: [
      { nombre: "LASAGNA MIXTA", cantidad: 2, valor: 86000 },
      { nombre: "LASAGNA DE POLLO", cantidad: 2, valor: 80000 },
      { nombre: "PZ POTOTO GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ POTOTO PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ MEXICANA PEQ", cantidad: 1, valor: 39600 },
      { nombre: "HB HAWAIANA", cantidad: 1, valor: 37000 },
      { nombre: "ALITAS PICANTES BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
    ]
  },
  {
    date: "2026-05-14", total: 211000, total_units: 5,
    productos: [
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ HAWAIANA MED", cantidad: 1, valor: 52800 },
      { nombre: "HB HAWAIANA", cantidad: 1, valor: 37000 },
      { nombre: "ENSALADA GRANJERA", cantidad: 1, valor: 36000 },
      { nombre: "PT CARBONARA JR", cantidad: 1, valor: 31200 },
    ]
  },
  {
    date: "2026-05-15", total: 432000, total_units: 13,
    productos: [
      { nombre: "PZ POTOTO PEQ", cantidad: 2, valor: 79200 },
      { nombre: "HB DE POLLO", cantidad: 2, valor: 74000 },
      { nombre: "NACHOS ESPECIALES", cantidad: 2, valor: 72000 },
      { nombre: "PZ POTOTO MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 2, valor: 22000 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-05-16", total: 1547200, total_units: 42,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 8, valor: 254400 },
      { nombre: "LASAGNA DE POLLO", cantidad: 4, valor: 160000 },
      { nombre: "PZ CARNAVAL GR", cantidad: 2, valor: 134400 },
      { nombre: "PZ MADRILENA GR", cantidad: 2, valor: 134400 },
      { nombre: "LASAGNA MIXTA", cantidad: 3, valor: 129000 },
      { nombre: "PT AL CAMPO JR", cantidad: 3, valor: 97200 },
      { nombre: "HB HAWAIANA", cantidad: 2, valor: 74000 },
      { nombre: "PZ POTOTO GR", cantidad: 1, valor: 67200 },
      { nombre: "ALITAS PICANTES BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "PZ NAPOLITANA PQ", cantidad: 2, valor: 55200 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 5, valor: 55000 },
      { nombre: "PZ MEXICANA MED", cantidad: 1, valor: 54000 },
      { nombre: "PT AL CAMPO RG", cantidad: 1, valor: 40200 },
      { nombre: "LASAGNA DE RES", cantidad: 1, valor: 40000 },
      { nombre: "PZ AB CARNES PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ PTLN 2 INGR RG", cantidad: 1, valor: 38400 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
    ]
  },
  {
    date: "2026-05-17", total: 402800, total_units: 11,
    productos: [
      { nombre: "PZ HAWAIANA PEQ", cantidad: 2, valor: 76800 },
      { nombre: "PZ POTOTO MED", cantidad: 1, valor: 54000 },
      { nombre: "PT AL CAMPO RG", cantidad: 1, valor: 40200 },
      { nombre: "PZ CARNAVAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "ENSALADA GRANJERA", cantidad: 1, valor: 36000 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
      { nombre: "NACHOS CLASICOS", cantidad: 1, valor: 31800 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "PZ MARGARITA PQ", cantidad: 1, valor: 30000 },
      { nombre: "PZ NAPOLITANA PQ", cantidad: 1, valor: 27600 },
    ]
  },
  {
    date: "2026-05-18", total: 52800, total_units: 1,
    productos: [
      { nombre: "PZ PEPERNATA MED", cantidad: 1, valor: 52800 },
    ]
  },
  {
    date: "2026-05-19", total: 0, total_units: 0,
    productos: []
  },
  {
    date: "2026-05-20", total: 307400, total_units: 8,
    productos: [
      { nombre: "PZ ESPAÑOLA MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "LASAGNA DE POLLO", cantidad: 1, valor: 40000 },
      { nombre: "PZ POTOTO PEQ", cantidad: 1, valor: 39600 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "PZ DE LA GRANJA PEQ", cantidad: 1, valor: 32400 },
      { nombre: "PT CARBONARA JR", cantidad: 2, valor: 62400 },
    ]
  },
  {
    date: "2026-05-21", total: 220400, total_units: 7,
    productos: [
      { nombre: "PZ POTOTO PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ HAWAIANA PEQ", cantidad: 1, valor: 38400 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 3, valor: 95400 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
    ]
  },
  {
    date: "2026-05-22", total: 1504800, total_units: 45,
    productos: [
      { nombre: "ADICION COMIDA", cantidad: 16, valor: 380000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 7, valor: 222600 },
      { nombre: "PZ AB CARNES GR", cantidad: 2, valor: 134400 },
      { nombre: "PZ CARNAVAL GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ MONTERREY GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ AB ESPECIAL MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ DE LA CASA MED", cantidad: 1, valor: 52800 },
      { nombre: "LASAGNA MIXTA", cantidad: 3, valor: 131000 },
      { nombre: "PZ MEXICANA PEQ", cantidad: 2, valor: 79200 },
      { nombre: "PZ PTLN 3 INGR RG", cantidad: 1, valor: 42000 },
      { nombre: "PZ POTOTO PEQ", cantidad: 1, valor: 39600 },
      { nombre: "NACHOS ESPECIALES", cantidad: 2, valor: 74000 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
      { nombre: "PZ NAPOLITANA PQ", cantidad: 1, valor: 27600 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 3, valor: 33000 },
      { nombre: "ALITAS PICANTES BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "EMPAQUE", cantidad: 2, valor: 4000 },
    ]
  },
  {
    date: "2026-05-23", total: 1100400, total_units: 30,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 4, valor: 127200 },
      { nombre: "PT AL CAMPO JR", cantidad: 3, valor: 97200 },
      { nombre: "LASAGNA MIXTA", cantidad: 2, valor: 86000 },
      { nombre: "PZ AB ESPECIAL GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ FLORENTINA GR", cantidad: 1, valor: 67200 },
      { nombre: "PT CARBONARA JR", cantidad: 2, valor: 62400 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ CARNAVAL ESP MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ POLLO CHAMPI MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ HAWAIANA MED", cantidad: 1, valor: 52800 },
      { nombre: "PZ AB CARNES PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ AMERICANA PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ MEXICANA PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PT CARBONARA RG", cantidad: 1, valor: 38400 },
      { nombre: "PZ HONGOS Y HUERTOS MED", cantidad: 1, valor: 38400 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
      { nombre: "ALITAS PICANTES BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "PT ALFREDO JR", cantidad: 1, valor: 31200 },
      { nombre: "PT BOLOGNESA JR", cantidad: 1, valor: 31200 },
      { nombre: "PZ NAPOLITANA PQ", cantidad: 1, valor: 27600 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 2, valor: 22000 },
      { nombre: "EMPAQUE", cantidad: 2, valor: 4000 },
    ]
  },
  {
    date: "2026-05-24", total: 74600, total_units: 3,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
    ]
  },
  {
    date: "2026-05-25", total: 54000, total_units: 1,
    productos: [
      { nombre: "PZ POTOTO MED", cantidad: 1, valor: 54000 },
    ]
  },
  {
    date: "2026-05-26", total: 0, total_units: 0,
    productos: []
  },
  {
    date: "2026-05-27", total: 187600, total_units: 4,
    productos: [
      { nombre: "PZ POLLO CHAMPI MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ POTOTO MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA DE POLLO", cantidad: 1, valor: 40000 },
      { nombre: "PZ POLLO CHAMPI PEQ", cantidad: 1, valor: 39600 },
    ]
  },
  {
    date: "2026-05-28", total: 373800, total_units: 9,
    productos: [
      { nombre: "LASAGNA MIXTA", cantidad: 4, valor: 172000 },
      { nombre: "LASAGNA DE POLLO", cantidad: 2, valor: 80000 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
    ]
  },
  {
    date: "2026-05-29", total: 1196000, total_units: 28,
    productos: [
      { nombre: "LASAGNA DE POLLO", cantidad: 4, valor: 160000 },
      { nombre: "LASAGNA MIXTA", cantidad: 4, valor: 172000 },
      { nombre: "LASAGNA DE RES", cantidad: 2, valor: 80000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 3, valor: 95400 },
      { nombre: "PZ FLORENTINA GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ AB ESPECIAL GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ POLLO CHAMPI GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ ESPANOLA MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ POTOTO MED", cantidad: 1, valor: 54000 },
      { nombre: "PT AL CAMPO RG", cantidad: 1, valor: 40200 },
      { nombre: "PZ POTOTO PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ PEPERNATA PEQ", cantidad: 1, valor: 38400 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "HB BBQ", cantidad: 1, valor: 36000 },
      { nombre: "ENSALADA GRANJERA", cantidad: 1, valor: 36000 },
      { nombre: "ALITAS PICANTES BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "PT BOLOGNESA JR", cantidad: 1, valor: 31200 },
      { nombre: "PZ MARGARITA PQ", cantidad: 1, valor: 30000 },
      { nombre: "CHAMPINONES PARMESANOS", cantidad: 1, valor: 28800 },
      { nombre: "FOCACCIA", cantidad: 1, valor: 14000 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
      { nombre: "ADICION COMIDA", cantidad: 1, valor: 4000 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-05-30", total: 335200, total_units: 9,
    productos: [
      { nombre: "LASAGNA MIXTA", cantidad: 3, valor: 129000 },
      { nombre: "PZ AB CARNES GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ ESPANOLA MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ MEXICANA PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ DE LA GRANJA PEQ", cantidad: 1, valor: 32400 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-06-01", total: 600000, total_units: 18,
    productos: [
      { nombre: "PZ POLLO CHAMPI MED", cantidad: 2, valor: 108000 },
      { nombre: "PZ MARGARITA MED", cantidad: 2, valor: 72000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ HAWAIANA MED", cantidad: 1, valor: 52800 },
      { nombre: "LASAGNA DE POLLO", cantidad: 1, valor: 40000 },
      { nombre: "PZ MEXICANA PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ CUATRO ESTACIONES PEQ", cantidad: 1, valor: 39600 },
      { nombre: "ALITAS PICANTES BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "PZ MARGARITA PQ", cantidad: 1, valor: 30000 },
      { nombre: "FOCACCIA", cantidad: 1, valor: 14000 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
      { nombre: "ADICION COMIDA", cantidad: 1, valor: 2000 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-06-02", total: 269400, total_units: 9,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA DE POLLO", cantidad: 1, valor: 40000 },
      { nombre: "PZ AB CARNES PEQ", cantidad: 1, valor: 39600 },
      { nombre: "HB HAWAIANA", cantidad: 1, valor: 37000 },
      { nombre: "PT POLLO BECHAMEL JR", cantidad: 1, valor: 31200 },
      { nombre: "EMPAQUE", cantidad: 2, valor: 4000 },
    ]
  },
  {
    date: "2026-06-03", total: 565400, total_units: 15,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 5, valor: 159000 },
      { nombre: "PZ POLLO CHAMPI GR", cantidad: 1, valor: 134400 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ POLLO CHAMPI MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ POLLO BBQ PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ HAWAIANA PEQ", cantidad: 1, valor: 38400 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
      { nombre: "EMPAQUE", cantidad: 2, valor: 4000 },
    ]
  },
  {
    date: "2026-06-04", total: 79200, total_units: 2,
    productos: [
      { nombre: "PZ CARNAVAL ESP PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ AB CARNES PEQ", cantidad: 1, valor: 39600 },
    ]
  },
  {
    date: "2026-06-05", total: 1015000, total_units: 25,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 5, valor: 159000 },
      { nombre: "PZ MARGARITA GR", cantidad: 2, valor: 98400 },
      { nombre: "PZ CARNAVAL MED", cantidad: 2, valor: 108000 },
      { nombre: "PT CARBONARA RG", cantidad: 2, valor: 76800 },
      { nombre: "PZ AB CARNES GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ POLLO CHAMPI GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ FLORENTINA GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ MONTERREY MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ POLLO CHAMPI MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PT BOLOGNESA RG", cantidad: 1, valor: 38400 },
      { nombre: "PZ HONGOS Y HUERTOS MED", cantidad: 1, valor: 38400 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
      { nombre: "CHAMPINONES PARMESANOS", cantidad: 1, valor: 28800 },
      { nombre: "EMPAQUE", cantidad: 2, valor: 4000 },
    ]
  },
  {
    date: "2026-06-06", total: 760000, total_units: 25,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 6, valor: 190800 },
      { nombre: "PZ MEXICANA PEQ", cantidad: 2, valor: 79200 },
      { nombre: "PT POLLO BECHAMEL JR", cantidad: 2, valor: 62400 },
      { nombre: "PZ AB CARNES PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ POLLO CHAMPI PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ VEGETARIANA MED", cantidad: 1, valor: 38400 },
      { nombre: "PZ HAWAIANA PEQ", cantidad: 1, valor: 38400 },
      { nombre: "PZ PEPERNATA PEQ", cantidad: 1, valor: 38400 },
      { nombre: "HB MEXICANA", cantidad: 1, valor: 37000 },
      { nombre: "HB DE POLLO", cantidad: 1, valor: 37000 },
      { nombre: "HB HAWAIANA", cantidad: 1, valor: 37000 },
      { nombre: "PZ HONGOS Y HUERTOS PQ", cantidad: 1, valor: 32400 },
      { nombre: "NACHOS CLASICOS", cantidad: 1, valor: 31800 },
      { nombre: "PZ MARGARITA PQ", cantidad: 1, valor: 30000 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 2, valor: 22000 },
      { nombre: "ADICION COMIDA", cantidad: 2, valor: 6000 },
    ]
  },
  {
    date: "2026-06-07", total: 965800, total_units: 23,
    productos: [
      { nombre: "PZ POTOTO GR", cantidad: 3, valor: 201600 },
      { nombre: "LASAGNA MIXTA", cantidad: 2, valor: 86000 },
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 2, valor: 79200 },
      { nombre: "PT AL BURRO RG", cantidad: 2, valor: 72000 },
      { nombre: "PZ POLLO BBQ MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ FLORENTINA MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ PEPERNATA MED", cantidad: 1, valor: 52800 },
      { nombre: "PZ MEXICANA PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ FLORENTINA PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PT CARBONARA RG", cantidad: 1, valor: 38400 },
      { nombre: "PT BOLOGNESA RG", cantidad: 1, valor: 38400 },
      { nombre: "PZ PEPERNATA PEQ", cantidad: 1, valor: 38400 },
      { nombre: "HB HAWAIANA", cantidad: 1, valor: 37000 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-06-08", total: 584600, total_units: 19,
    productos: [
      { nombre: "PZ FLORENTINA GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ AB ESPECIAL MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ POTOTO MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "LASAGNA DE POLLO", cantidad: 1, valor: 40000 },
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 2, valor: 79200 },
      { nombre: "PT POLLO BECHAMEL RG", cantidad: 1, valor: 38400 },
      { nombre: "HB DE POLLO", cantidad: 1, valor: 37000 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "PT POLLO BECHAMEL JR", cantidad: 1, valor: 31200 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 3, valor: 33000 },
      { nombre: "ADICION BAR", cantidad: 1, valor: 5000 },
      { nombre: "EMPAQUE", cantidad: 2, valor: 4000 },
    ]
  },
  {
    date: "2026-06-09", total: 361200, total_units: 8,
    productos: [
      { nombre: "LASAGNA DE POLLO", cantidad: 4, valor: 160000 },
      { nombre: "PZ AB ESPECIAL GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "HB DE POLLO", cantidad: 1, valor: 37000 },
    ]
  },
  {
    date: "2026-06-10", total: 576600, total_units: 15,
    productos: [
      { nombre: "NACHOS ESPECIALES", cantidad: 3, valor: 108000 },
      { nombre: "PZ AB CARNES GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ CARNAVAL ESP GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ MEXICANA GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ CARNAVAL ESP MED", cantidad: 1, valor: 54000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 4, valor: 127200 },
      { nombre: "ALITAS PICANTES BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "ENSALADA GRANJERA", cantidad: 1, valor: 36000 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
      { nombre: "ADICION COMIDA", cantidad: 1, valor: 7000 },
    ]
  },
  {
    date: "2026-06-11", total: 189600, total_units: 5,
    productos: [
      { nombre: "ENSALADA GRANJERA", cantidad: 2, valor: 72000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "PZ AB ESPECIAL MED", cantidad: 1, valor: 54000 },
    ]
  },
  {
    date: "2026-06-12", total: 661200, total_units: 19,
    productos: [
      { nombre: "PZ CARNAVAL GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ CARNAVAL MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ DE LA GRANJA MED", cantidad: 1, valor: 44400 },
      { nombre: "LASAGNA DE POLLO", cantidad: 1, valor: 40000 },
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 2, valor: 79200 },
      { nombre: "PZ CARNAVAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ POLLO CHAMPI PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PT CARBONARA RG", cantidad: 1, valor: 38400 },
      { nombre: "PT AL CAMPO JR", cantidad: 2, valor: 64800 },
      { nombre: "PT BOLOGNESA JR", cantidad: 1, valor: 31200 },
      { nombre: "CHAMPINONES PARMESANOS", cantidad: 1, valor: 28800 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 4, valor: 44000 },
    ]
  },
  {
    date: "2026-06-13", total: 934800, total_units: 25,
    productos: [
      { nombre: "PT CARBONARA RG", cantidad: 3, valor: 115200 },
      { nombre: "HB DE POLLO", cantidad: 3, valor: 111000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 3, valor: 95400 },
      { nombre: "PT BOLOGNESA RG", cantidad: 2, valor: 76800 },
      { nombre: "PZ MEXICANA GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ PEPERNATA GR", cantidad: 1, valor: 66000 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "PT AL CAMPO RG", cantidad: 1, valor: 40200 },
      { nombre: "LASAGNA DE RES", cantidad: 1, valor: 40000 },
      { nombre: "PZ POTOTO PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ AB CARNES PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ PEPERNATA PEQ", cantidad: 1, valor: 38400 },
      { nombre: "NACHOS CON CHILI", cantidad: 1, valor: 36000 },
      { nombre: "ENSALADA GRANJERA", cantidad: 1, valor: 36000 },
      { nombre: "PT AL CAMPO JR", cantidad: 1, valor: 32400 },
      { nombre: "ADICION COMIDA", cantidad: 1, valor: 2000 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-06-14", total: 842200, total_units: 22,
    productos: [
      { nombre: "PZ POLLO CHAMPI GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ AB CARNES GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ AB CARNES MED", cantidad: 2, valor: 108000 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "LASAGNA DE POLLO", cantidad: 1, valor: 40000 },
      { nombre: "PZ ESPANOLA PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ HAWAIANA PEQ", cantidad: 1, valor: 38400 },
      { nombre: "HB DE POLLO", cantidad: 2, valor: 74000 },
      { nombre: "HB MEXICANA", cantidad: 1, valor: 37000 },
      { nombre: "NACHOS CON CHILI", cantidad: 1, valor: 36000 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "PZ DE LA GRANJA PEQ", cantidad: 1, valor: 32400 },
      { nombre: "NACHOS CLASICOS", cantidad: 1, valor: 31800 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 3, valor: 95400 },
      { nombre: "ALITAS PICANTES BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "PT BOLOGNESA JR", cantidad: 1, valor: 31200 },
      { nombre: "PT CARBONARA JR", cantidad: 1, valor: 31200 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-06-15", total: 71800, total_units: 2,
    productos: [
      { nombre: "LASAGNA DE RES", cantidad: 1, valor: 40000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
    ]
  },
  {
    date: "2026-06-16", total: 465200, total_units: 11,
    productos: [
      { nombre: "PZ FLORENTINA GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ HAWAIANA PEQ", cantidad: 1, valor: 38400 },
      { nombre: "PT CARBONARA JR", cantidad: 1, valor: 31200 },
      { nombre: "PZ MARGARITA GR", cantidad: 1, valor: 49200 },
      { nombre: "PZ DE LA GRANJA GR", cantidad: 1, valor: 55200 },
      { nombre: "LASAGNA MIXTA", cantidad: 3, valor: 129000 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
      { nombre: "PZ AB ESPECIAL MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ MARGARITA PQ", cantidad: 1, valor: 30000 },
    ]
  },
  {
    date: "2026-06-17", total: 1667000, total_units: 42,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 8, valor: 254400 },
      { nombre: "ALITAS PICANTES BUFFALO", cantidad: 3, valor: 95400 },
      { nombre: "HB DE POLLO", cantidad: 1, valor: 37000 },
      { nombre: "HB DE RES", cantidad: 2, valor: 70000 },
      { nombre: "HB HAWAIANA", cantidad: 1, valor: 37000 },
      { nombre: "NACHOS ESPECIALES", cantidad: 2, valor: 72000 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 4, valor: 44000 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ AB CARNES PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ AB ESPECIAL GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ AB ESPECIAL MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 2, valor: 79200 },
      { nombre: "PZ CARNAVAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ DE LA GRANJA PEQ", cantidad: 1, valor: 33600, nota: "Ajuste +3000 para cuadrar total POS (relación trae 30600/32400)" },
      { nombre: "PZ ESPAÑOLA PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ FLORENTINA PEQ", cantidad: 1, valor: 38400 },
      { nombre: "PZ HAWAIANA GR", cantidad: 1, valor: 66000 },
      { nombre: "PZ HAWAIANA PEQ", cantidad: 2, valor: 76800 },
      { nombre: "PZ NAPOLITANA PQ", cantidad: 1, valor: 27600 },
      { nombre: "PZ POLLO CHAMPI GR", cantidad: 2, valor: 134400 },
      { nombre: "PZ POLLO CHAMPI PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ POTOTO GR", cantidad: 3, valor: 201600 },
      { nombre: "PZ SALAMI IMPORTADO GR", cantidad: 1, valor: 66000 },
    ]
  },
  {
    date: "2026-06-18", total: 370600, total_units: 11,
    productos: [
      { nombre: "PT BOLOGNESA RG", cantidad: 1, valor: 38400 },
      { nombre: "PT CARBONARA RG", cantidad: 2, valor: 76800 },
      { nombre: "ADICION COMIDA", cantidad: 1, valor: 4000 },
      { nombre: "HB HAWAIANA", cantidad: 1, valor: 37000 },
      { nombre: "LASAGNA DE POLLO", cantidad: 2, valor: 72000 },
      { nombre: "PZ AB ESPECIAL MED", cantidad: 1, valor: 54000 },
      { nombre: "HB DE RES", cantidad: 1, valor: 28000 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 28800 },
      { nombre: "PZ POTOTO PEQ", cantidad: 1, valor: 31600 },
    ]
  },
  {
    date: "2026-06-19", total: 689400, total_units: 17,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 4, valor: 127200 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 2, valor: 22000 },
      { nombre: "PZ POTOTO GR", cantidad: 2, valor: 134400 },
      { nombre: "PZ FLORENTINA GR", cantidad: 2, valor: 134400 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "PT AL CAMPO RG", cantidad: 1, valor: 40200 },
      { nombre: "PZ MEXICANA PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "NACHOS CON CHILI", cantidad: 1, valor: 36000 },
      { nombre: "HB DE POLLO", cantidad: 1, valor: 37000 },
    ]
  },
  {
    date: "2026-06-20", total: 974400, total_units: 25,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 4, valor: 127200 },
      { nombre: "ALITAS PICANTES BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "ENSALADA GRANJERA", cantidad: 2, valor: 72000 },
      { nombre: "HB DE POLLO", cantidad: 1, valor: 37000 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
      { nombre: "HB HAWAIANA", cantidad: 2, valor: 74000 },
      { nombre: "LASAGNA MIXTA", cantidad: 4, valor: 172000 },
      { nombre: "PT BOLOGNESA JR", cantidad: 1, valor: 31200 },
      { nombre: "PT POLLO BECHAMEL JR", cantidad: 1, valor: 31200 },
      { nombre: "PT POLLO BECHAMEL RG", cantidad: 1, valor: 38400 },
      { nombre: "PZ AB ESPECIAL MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ CARNAVAL ESP MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ HAWAIANA PEQ", cantidad: 1, valor: 38400 },
      { nombre: "PZ POLLO CHAMPI GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ POTOTO PEQ", cantidad: 1, valor: 39600 },
    ]
  },
  {
    date: "2026-06-22", total: 596800, total_units: 16,
    productos: [
      { nombre: "PT CARBONARA JR", cantidad: 1, valor: 31200 },
      { nombre: "HB BBQ", cantidad: 1, valor: 36000 },
      { nombre: "NACHOS CON CHILI", cantidad: 1, valor: 36000 },
      { nombre: "PZ MEXICANA MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ MADRILENA MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "NACHOS CLASICOS", cantidad: 1, valor: 31800 },
      { nombre: "PT POLLO BECHAMEL RG", cantidad: 1, valor: 38400 },
      { nombre: "LASAGNA DE POLLO", cantidad: 1, valor: 40000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
      { nombre: "PT ALFREDO RG", cantidad: 2, valor: 76800 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "PZ DE LA CASA PEQ", cantidad: 1, valor: 38400 },
      { nombre: "PT CARBONARA RG", cantidad: 1, valor: 38400 },
    ]
  },
  {
    date: "2026-06-23", total: 1052600, total_units: 27,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 3, valor: 95400 },
      { nombre: "ALITAS PICANTES BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "HB BBQ", cantidad: 1, valor: 36000 },
      { nombre: "HB DE RES CON CHAMPI", cantidad: 1, valor: 36000 },
      { nombre: "LASAGNA DE POLLO", cantidad: 3, valor: 120000 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 4, valor: 44000 },
      { nombre: "PZ AB CARNES GR", cantidad: 2, valor: 134400 },
      { nombre: "PZ CARNAVAL ESP PEQ", cantidad: 2, valor: 79200 },
      { nombre: "PZ CARNAVAL MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ DE LA GRANJA GR", cantidad: 1, valor: 55200 },
      { nombre: "PZ HAWAIANA MED", cantidad: 1, valor: 52800 },
      { nombre: "PZ HAWAIANA PEQ", cantidad: 1, valor: 38400 },
      { nombre: "PZ MARGARITA PQ", cantidad: 1, valor: 30000 },
      { nombre: "PZ NAPOLITANA GR", cantidad: 1, valor: 38400 },
      { nombre: "PZ PEPERNATA GR", cantidad: 1, valor: 66000 },
      { nombre: "PZ POLLO CHAMPI GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ PTLN 3 INGR RG", cantidad: 1, valor: 42000 },
    ]
  },
  {
    date: "2026-06-24", total: 188400, total_units: 4,
    productos: [
      { nombre: "PZ AB CARNES GR", cantidad: 1, valor: 67200 },
      { nombre: "HB BBQ", cantidad: 1, valor: 36000 },
      { nombre: "PT BOLOGNESA JR", cantidad: 1, valor: 31200 },
      { nombre: "PZ POTOTO MED", cantidad: 1, valor: 54000 },
    ]
  },
  {
    date: "2026-06-25", total: 93600, total_units: 2,
    productos: [
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ IBIZA PEQ", cantidad: 1, valor: 39600 },
    ]
  },
  {
    date: "2026-06-26", total: 340200, total_units: 11,
    productos: [
      { nombre: "PZ AB ESPECIAL GR", cantidad: 1, valor: 67200 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 3, valor: 95400 },
      { nombre: "PZ DE LA GRANJA GR (EMPLEADO cortesía)", cantidad: 1, valor: 0 },
      { nombre: "LASAGNA DE RES", cantidad: 2, valor: 80000 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
      { nombre: "ADICION COMIDA", cantidad: 1, valor: 4000 },
    ]
  },
  {
    date: "2026-06-27", total: 666000, total_units: 18,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 4, valor: 127200 },
      { nombre: "PZ NAPOLITANA GR", cantidad: 2, valor: 76800 },
      { nombre: "LASAGNA DE RES", cantidad: 2, valor: 80000 },
      { nombre: "PZ POTOTO GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ HAWAIANA GR", cantidad: 1, valor: 66000 },
      { nombre: "PZ PEPERNATA GR", cantidad: 1, valor: 66000 },
      { nombre: "PZ POLLO CHAMPI PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ AB CARNES PEQ", cantidad: 1, valor: 39600 },
      { nombre: "HB HAWAIANA", cantidad: 1, valor: 37000 },
      { nombre: "PZ NAPOLITANA MED", cantidad: 1, valor: 33600 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 3, valor: 33000 },
    ]
  },
  {
    date: "2026-06-28", total: 172600, total_units: 6,
    productos: [
      { nombre: "PT AL CAMPO JR", cantidad: 3, valor: 97200 },
      { nombre: "PT AL CAMPO RG", cantidad: 1, valor: 40200 },
      { nombre: "PT CARBONARA JR", cantidad: 1, valor: 31200 },
      { nombre: "ADICION COMIDA", cantidad: 1, valor: 4000 },
    ]
  },
  {
    date: "2026-06-29", total: 268000, total_units: 8,
    productos: [
      { nombre: "PZ POLLO CHAMPI GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ CARNAVAL ESP MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ POLLO CHAMPI PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ MONTERREY PEQ", cantidad: 1, valor: 39600 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "PT AL BURRO JR", cantidad: 1, valor: 28800 },
      { nombre: "ADICION COMIDA", cantidad: 1, valor: 5000 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-06-30", total: 213000, total_units: 0,
    productos: [
      { nombre: "DETALLE PENDIENTE (foto cocina no legible - por transcribir)", cantidad: 0, valor: 213000 },
    ]
  },
  {
    date: "2026-07-01", total: 247800, total_units: 6,
    productos: [
      { nombre: "PZ AB ESPECIAL GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA DE POLLO", cantidad: 1, valor: 40000 },
      { nombre: "PZ CARNAVAL ESP PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PT AL BURRO RG", cantidad: 1, valor: 36000 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
    ]
  },
  {
    date: "2026-07-02", total: 459400, total_units: 8,
    productos: [
      { nombre: "PZ AB ESPECIAL GR", cantidad: 3, valor: 201600 },
      { nombre: "PZ AMERICANA GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ FLORENTINA GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ MEXICANA MED", cantidad: 1, valor: 54000 },
      { nombre: "HB DE POLLO", cantidad: 1, valor: 37000 },
      { nombre: "PZ VEGETARIANA PQ", cantidad: 1, valor: 32400 },
    ]
  },
  {
    date: "2026-07-03", total: 1247400, total_units: 33,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 10, valor: 318000 },
      { nombre: "PZ HAWAIANA PEQ", cantidad: 3, valor: 115200 },
      { nombre: "PZ POTOTO GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ MEXICANA GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ MONTERREY GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ HAWAIANA GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ AB ESPECIAL GR", cantidad: 1, valor: 67200 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 6, valor: 66000 },
      { nombre: "PZ AB CARNES GR", cantidad: 1, valor: 66000 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ HAWAIANA MED", cantidad: 1, valor: 52800 },
      { nombre: "PZ BOLOGNESA MED", cantidad: 1, valor: 50400 },
      { nombre: "PZ MADRILENA PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ MONTERREY PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ POLLO CHAMPI PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ PEPERNATA PEQ", cantidad: 1, valor: 38400 },
      { nombre: "ALITAS PICANTES BUFFALO", cantidad: 1, valor: 31800 },
    ]
  },
  {
    date: "2026-07-04", total: 591600, total_units: 14,
    productos: [
      { nombre: "HB BBQ", cantidad: 2, valor: 72000 },
      { nombre: "PZ POLLO CHAMPI MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ AB ESPECIAL MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ HAWAIANA MED", cantidad: 1, valor: 52800 },
      { nombre: "PZ DE LA CASA MED", cantidad: 1, valor: 52800 },
      { nombre: "LASAGNA DE RES", cantidad: 1, valor: 40000 },
      { nombre: "LASAGNA DE POLLO", cantidad: 1, valor: 40000 },
      { nombre: "PZ POLLO CHAMPI PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "ENSALADA GRANJERA", cantidad: 1, valor: 36000 },
      { nombre: "HB DE RES CON CHAMPI", cantidad: 1, valor: 36000 },
      { nombre: "PT AL CAMPO JR", cantidad: 1, valor: 32400 },
      { nombre: "ADICION COMIDA", cantidad: 1, valor: 4000 },
      { nombre: "DIFERENCIA POS vs relación cocina (por itemizar)", cantidad: 0, valor: 38400, nota: "FLAG: pizzería POS $591.600 vs relación cocina $553.200 (Δ $38.400). Falta ~1 ítem (posible pizza ~$38.400)." },
    ]
  },
  {
    date: "2026-07-05", total: 111000, total_units: 4,
    productos: [
      { nombre: "HB DE POLLO", cantidad: 1, valor: 37000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "PT CARBONARA JR", cantidad: 1, valor: 31200 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
    ]
  },
  {
    date: "2026-07-06", total: 66000, total_units: 2,
    productos: [
      { nombre: "PZ NAPOLITANA MED", cantidad: 1, valor: 33600 },
      { nombre: "PZ DE LA GRANJA PEQ", cantidad: 1, valor: 32400 },
    ]
  },
  {
    date: "2026-07-07", total: 688800, total_units: 18,
    productos: [
      { nombre: "PZ CARNAVAL GR", cantidad: 2, valor: 134400 },
      { nombre: "PZ CARNAVAL PEQ", cantidad: 2, valor: 79200 },
      { nombre: "PZ SALAMI IMPORTADO GR", cantidad: 1, valor: 66000 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 5, valor: 55000 },
      { nombre: "PZ AB ESPECIAL MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ DE LA CASA MED", cantidad: 1, valor: 52800 },
      { nombre: "PZ HAWAIANA MED", cantidad: 1, valor: 52800 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "LASAGNA DE POLLO", cantidad: 1, valor: 40000 },
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "HB DE POLLO", cantidad: 1, valor: 37000 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
    ]
  },
  {
    date: "2026-07-08", total: 141400, total_units: 5,
    productos: [
      { nombre: "PZ AB ESPECIAL MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ PEPERNATA PEQ", cantidad: 1, valor: 38400 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-07-09", total: 39600, total_units: 1,
    productos: [
      { nombre: "PZ AB CARNES PEQ", cantidad: 1, valor: 39600 },
    ]
  },
  {
    date: "2026-07-10", total: 950200, total_units: 27,
    productos: [
      { nombre: "LASAGNA DE POLLO", cantidad: 6, valor: 240000, nota: "Tirilla: 2 líneas de $40.000 (1 ud) + 2 líneas de $80.000 (2 uds c/u)" },
      { nombre: "LASAGNA MIXTA", cantidad: 3, valor: 129000, nota: "Tirilla: $86.000 (2 uds) + $43.000 (1 ud)" },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 3, valor: 95400 },
      { nombre: "PZ HAWAIANA MED", cantidad: 1, valor: 52800 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA DE RES", cantidad: 1, valor: 40000 },
      { nombre: "PZ POLLO CHAMPI PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ PEPERNATA PEQ", cantidad: 1, valor: 38400 },
      { nombre: "HB HAWAIANA", cantidad: 1, valor: 37000 },
      { nombre: "LASAGNA VEGETARIANA", cantidad: 1, valor: 36000 },
      { nombre: "HB DE RES CON CHAMPI", cantidad: 1, valor: 36000 },
      { nombre: "PZ VEGETARIANA PQ", cantidad: 1, valor: 32400 },
      { nombre: "ALITAS PICANTES BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "PT CARBONARA JR", cantidad: 1, valor: 31200 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
      { nombre: "ADICION COMIDA", cantidad: 1, valor: 4000 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-07-11", total: 384800, total_units: 12,
    productos: [
      { nombre: "HB DE RES", cantidad: 3, valor: 105000, nota: "Tirilla: $70.000 (2 uds) + $35.000 (1 ud)" },
      { nombre: "HB HAWAIANA", cantidad: 2, valor: 74000, nota: "Línea $74.000 = 2 uds" },
      { nombre: "PT AL CAMPO JR", cantidad: 2, valor: 64800, nota: "Línea $64.800 = 2 uds" },
      { nombre: "PT BOLOGNESA RG", cantidad: 1, valor: 38400 },
      { nombre: "HB MEXICANA", cantidad: 1, valor: 37000 },
      { nombre: "PZ MARGARITA MED", cantidad: 1, valor: 36000 },
      { nombre: "PZ NAPOLITANA PQ", cantidad: 1, valor: 27600 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-07-12", total: 442000, total_units: 15,
    productos: [
      { nombre: "LASAGNA DE POLLO", cantidad: 2, valor: 80000, nota: "Línea $80.000 = 2 uds" },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "PT CARBONARA JR", cantidad: 2, valor: 62400, nota: "Línea $62.400 = 2 uds" },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 4, valor: 44000 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "PZ POLLO BBQ PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PT CARBONARA RG", cantidad: 1, valor: 38400 },
      { nombre: "LASAGNA VEGETARIANA", cantidad: 1, valor: 36000 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
    ]
  },
  {
    date: "2026-07-13", total: 338400, total_units: 10,
    productos: [
      { nombre: "PZ POLLO BBQ GR", cantidad: 1, valor: 67200 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "LASAGNA DE RES", cantidad: 1, valor: 40000 },
      { nombre: "PZ FLORENTINA PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ HONGOS Y HUERTOS MED", cantidad: 1, valor: 38400 },
      { nombre: "PT ALFREDO RG", cantidad: 1, valor: 38400 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "EMPAQUE", cantidad: 2, valor: 4000 },
    ]
  },
  {
    date: "2026-07-14", total: 128200, total_units: 3,
    productos: [
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "PT BOLOGNESA JR", cantidad: 1, valor: 31200 },
    ]
  },
  {
    date: "2026-07-15", total: 194600, total_units: 5,
    productos: [
      { nombre: "PZ AB ESPECIAL MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA DE POLLO", cantidad: 1, valor: 40000 },
      { nombre: "HB MEXICANA", cantidad: 1, valor: 37000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 2, valor: 63600 },
    ]
  },
  {
    date: "2026-07-16", total: 250800, total_units: 7,
    productos: [
      { nombre: "PZ POTOTO PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PT BOLOGNESA RG", cantidad: 1, valor: 38400 },
      { nombre: "PT CARBONARA RG", cantidad: 1, valor: 38400 },
      { nombre: "PZ PEPERNATA PEQ", cantidad: 1, valor: 38400 },
      { nombre: "PT AL CAMPO JR", cantidad: 1, valor: 32400 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 2, valor: 63600 },
    ]
  },
  {
    date: "2026-07-17", total: 744800, total_units: 17,
    productos: [
      { nombre: "PZ AB CARNES GR", cantidad: 2, valor: 134400 },
      { nombre: "PZ AB CARNES MED", cantidad: 2, valor: 108000 },
      { nombre: "LASAGNA DE POLLO", cantidad: 2, valor: 80000, nota: "Línea $80.000 = 2 uds" },
      { nombre: "PT CARBONARA JR", cantidad: 2, valor: 62400 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "PZ POTOTO MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ POLLO CHAMPI MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ MEXICANA MED", cantidad: 1, valor: 54000 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "ENSALADA GRANJERA", cantidad: 1, valor: 36000 },
      { nombre: "PZ DE LA GRANJA PEQ", cantidad: 1, valor: 32400 },
      { nombre: "PZ MARGARITA PQ", cantidad: 1, valor: 30000 },
    ]
  },
  {
    date: "2026-07-18", total: 550800, total_units: 16,
    productos: [
      { nombre: "PT AL CAMPO RG", cantidad: 2, valor: 80400, nota: "Línea $80.400 = 2 uds" },
      { nombre: "PZ MEXICANA PEQ", cantidad: 2, valor: 79200 },
      { nombre: "PZ DE LA GRANJA MED", cantidad: 1, valor: 44400 },
      { nombre: "LASAGNA DE RES", cantidad: 1, valor: 40000 },
      { nombre: "LASAGNA DE POLLO", cantidad: 1, valor: 40000 },
      { nombre: "PZ CARNAVAL ESP PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "HB HAWAIANA", cantidad: 1, valor: 37000 },
      { nombre: "NACHOS CON CHILI", cantidad: 1, valor: 36000 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "ALITAS PICANTES BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "FOCACCIA", cantidad: 1, valor: 14000 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-07-19", total: 605200, total_units: 18,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 4, valor: 127200 },
      { nombre: "LASAGNA DE POLLO", cantidad: 2, valor: 80000, nota: "Línea $80.000 = 2 uds" },
      { nombre: "PZ HAWAIANA MED", cantidad: 1, valor: 52800 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "PZ POTOTO PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ AB CARNES PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ POLLO CHAMPI PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PT BOLOGNESA RG", cantidad: 1, valor: 38400 },
      { nombre: "HB DE RES CON CHAMPI", cantidad: 1, valor: 36000 },
      { nombre: "PT AL CAMPO JR", cantidad: 1, valor: 32400 },
      { nombre: "PZ PTLN 2 INGR JR", cantidad: 1, valor: 32400 },
      { nombre: "PT BOLOGNESA JR", cantidad: 1, valor: 31200 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-07-20", total: 316200, total_units: 8,
    productos: [
      { nombre: "PZ AB CARNES MED", cantidad: 2, valor: 108000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "PZ FLORENTINA MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA DE RES", cantidad: 1, valor: 40000 },
      { nombre: "PZ CARNAVAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
    ]
  },
  {
    date: "2026-07-21", total: 338200, total_units: 9,
    productos: [
      { nombre: "PZ POTOTO GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ MEXICANA PEQ", cantidad: 1, valor: 39600 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "NACHOS CLASICOS", cantidad: 1, valor: 31800 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
    ]
  },
  {
    date: "2026-07-22", total: 535800, total_units: 14,
    productos: [
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 2, valor: 79200 },
      { nombre: "PZ CUATRO ESTACIONES MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ POTOTO MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ MEXICANA MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "PZ PTLN 3 INGR RG", cantidad: 1, valor: 42000 },
      { nombre: "LASAGNA DE RES", cantidad: 1, valor: 40000 },
      { nombre: "ENSALADA GRANJERA", cantidad: 1, valor: 36000 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
      { nombre: "PZ NAPOLITANA MED", cantidad: 1, valor: 33600 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "PT POLLO BECHAMEL JR", cantidad: 1, valor: 31200 },
      { nombre: "ADICION COMIDA", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-07-23", total: 120200, total_units: 5,
    productos: [
      { nombre: "PZ CARNAVAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ FLORENTINA PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PT AL BURRO RG", cantidad: 1, valor: 36000 },
      { nombre: "ADIC QUESO", cantidad: 1, valor: 3000 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-07-24", total: 454400, total_units: 13,
    productos: [
      { nombre: "PZ POTOTO GR", cantidad: 1, valor: 67200 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "PZ DE LA GRANJA MED", cantidad: 1, valor: 44400 },
      { nombre: "LASAGNA DE RES", cantidad: 1, valor: 40000 },
      { nombre: "PZ CARNAVAL ESP PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ MEXICANA PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "HB BBQ", cantidad: 1, valor: 36000 },
      { nombre: "PT AL CAMPO JR", cantidad: 1, valor: 32400 },
      { nombre: "PZ MARGARITA PQ", cantidad: 1, valor: 30000 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 2, valor: 22000 },
    ]
  },
  {
    date: "2026-07-25", total: 1049400, total_units: 31,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 6, valor: 190800 },
      { nombre: "PZ HAWAIANA PEQ", cantidad: 3, valor: 115200 },
      { nombre: "PT AL CAMPO RG", cantidad: 2, valor: 80400 },
      { nombre: "LASAGNA DE POLLO", cantidad: 2, valor: 80000 },
      { nombre: "NACHOS ESPECIALES", cantidad: 2, valor: 72000 },
      { nombre: "PZ AB ESPECIAL GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ POTOTO GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ MEXICANA MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ HAWAIANA MED", cantidad: 1, valor: 52800 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 4, valor: 44000 },
      { nombre: "PZ CARNAVAL ESP PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ MONTERREY PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ NAPOLITANA GR", cantidad: 1, valor: 38400 },
      { nombre: "HB DE POLLO", cantidad: 1, valor: 37000 },
      { nombre: "HB DE RES CON CHAMPI", cantidad: 1, valor: 36000 },
      { nombre: "PT CARBONARA JR", cantidad: 1, valor: 31200 },
      { nombre: "EMPAQUE", cantidad: 2, valor: 4000 },
    ]
  },
  {
    date: "2026-07-26", total: 85200, total_units: 2,
    productos: [
      { nombre: "PZ FLORENTINA MED", cantidad: 1, valor: 54000 },
      { nombre: "PT CARBONARA JR", cantidad: 1, valor: 31200 },
    ]
  },
  {
    date: "2026-07-27", total: 28800, total_units: 1,
    productos: [
      { nombre: "CHAMPINONES PARMESANOS", cantidad: 1, valor: 28800 },
    ]
  },
  {
    date: "2026-07-28", total: 71800, total_units: 2,
    productos: [
      { nombre: "LASAGNA DE POLLO", cantidad: 1, valor: 40000 },
      { nombre: "NACHOS CLASICOS", cantidad: 1, valor: 31800 },
    ]
  },
  {
    date: "2026-07-29", total: 192400, total_units: 6,
    productos: [
      { nombre: "PT AL CAMPO RG", cantidad: 1, valor: 40200 },
      { nombre: "PT CARBONARA RG", cantidad: 1, valor: 38400 },
      { nombre: "HB DE RES CON CHAMPI", cantidad: 1, valor: 36000 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
    ]
  },
  {
    date: "2026-07-30", total: 221200, total_units: 7,
    productos: [
      { nombre: "HB DE POLLO", cantidad: 2, valor: 74000 },
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ POLLO CHAMPI PEQ", cantidad: 1, valor: 39600 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "PT CARBONARA JR", cantidad: 1, valor: 31200 },
      { nombre: "ADICION COMIDA", cantidad: 1, valor: 5000 },
    ]
  },
  {
    date: "2026-07-31", total: 881800, total_units: 25,
    productos: [
      { nombre: "HB DE POLLO", cantidad: 3, valor: 111000, nota: "1 línea de $37.000 + 1 línea de $74.000 (2 uds)" },
      { nombre: "PZ AB ESPECIAL GR", cantidad: 1, valor: 67200 },
      { nombre: "ALITAS PICANTES BUFF", cantidad: 2, valor: 63600 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ DE LA CASA MED", cantidad: 1, valor: 52800 },
      { nombre: "PT CARBONARA JR", cantidad: 2, valor: 62400 },
      { nombre: "PZ MARGARITA PQ", cantidad: 2, valor: 60000 },
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 2, valor: 79200 },
      { nombre: "LASAGNA DE POLLO", cantidad: 1, valor: 40000 },
      { nombre: "PZ POLLO BBQ PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ POTOTO PEQ", cantidad: 1, valor: 39600 },
      { nombre: "HB BBQ", cantidad: 1, valor: 36000 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
      { nombre: "PT AL CAMPO JR", cantidad: 1, valor: 32400 },
      { nombre: "PZ HONGOS Y HUERTOS PQ", cantidad: 1, valor: 32400 },
      { nombre: "PZ VEGETARIANA PQ", cantidad: 1, valor: 32400 },
      { nombre: "PT BOLOGNESA JR", cantidad: 1, valor: 31200 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
      { nombre: "ADICION COMIDA", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-08-01", total: 416000, total_units: 12,
    productos: [
      { nombre: "HB DE POLLO", cantidad: 2, valor: 74000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "PZ POLLO CHAMPI MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA MIXTA", cantidad: 1, valor: 43000 },
      { nombre: "PZ AB ESPECIAL PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ POTOTO PEQ", cantidad: 1, valor: 39600 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "PZ DE LA GRANJA PEQ", cantidad: 1, valor: 32400 },
      { nombre: "ALITAS PICANTES BUFF", cantidad: 1, valor: 31800 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
    ]
  },
  {
    date: "2026-08-02", total: 205800, total_units: 4,
    productos: [
      { nombre: "PZ AB CARNES GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ HAWAIANA MED", cantidad: 1, valor: 52800 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
    ]
  },
  {
    date: "2026-08-03", total: 138600, total_units: 3,
    productos: [
      { nombre: "PZ POLLO CHAMPI MED", cantidad: 1, valor: 54000 },
      { nombre: "PZ HAWAIANA MED", cantidad: 1, valor: 52800 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
    ]
  },
  {
    date: "2026-08-04", total: 389600, total_units: 11,
    productos: [
      { nombre: "PZ FLORENTINA GR", cantidad: 1, valor: 67200 },
      { nombre: "LASAGNA DE RES", cantidad: 1, valor: 40000 },
      { nombre: "PZ CUATRO ESTACIONES PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ POLLO BBQ PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PZ FLORENTINA PEQ", cantidad: 1, valor: 39600 },
      { nombre: "HB HAWAIANA", cantidad: 1, valor: 37000 },
      { nombre: "PZ PTLN 3 INGR JR", cantidad: 1, valor: 36000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "PZ MARGARITA PQ", cantidad: 1, valor: 30000 },
      { nombre: "CHAMPINONES PARMESANOS", cantidad: 1, valor: 28800 },
      { nombre: "PZ POLLO BBQ GR", cantidad: 1, valor: 0, nota: "🚩 FACTURADA EN $0 (factura A-017870). Pizza grande, PVP carta ~$67.200. Aparece en el acumulado como 1 unidad vendida pero con valor cero — confirmar si fue cortesía, reposición por error de cocina o descuento total. El 80% del costo igual lo asume el aliado, pero La Sala pierde su 20%." },
    ]
  },
  {
    date: "2026-08-05", total: 284600, total_units: 7,
    productos: [
      { nombre: "PZ FLORENTINA GR", cantidad: 1, valor: 67200 },
      { nombre: "LASAGNA DE POLLO", cantidad: 2, valor: 80000 },
      { nombre: "PT POLLO BECHAMEL RG", cantidad: 1, valor: 38400 },
      { nombre: "ENSALADA GRANJERA", cantidad: 1, valor: 36000 },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 1, valor: 31800 },
      { nombre: "PT ALFREDO JR", cantidad: 1, valor: 31200 },
    ]
  },
  {
    date: "2026-08-06", total: 1200600, total_units: 33,
    productos: [
      { nombre: "LASAGNA DE POLLO", cantidad: 6, valor: 240000, nota: "1 línea de $40.000 + 1 línea de $200.000 (5 uds)" },
      { nombre: "LASAGNA MIXTA", cantidad: 5, valor: 215000, nota: "Línea única de $215.000 = 5 uds a $43.000" },
      { nombre: "LASAGNA DE RES", cantidad: 2, valor: 80000 },
      { nombre: "PT CARBONARA RG", cantidad: 2, valor: 76800 },
      { nombre: "HB DE POLLO", cantidad: 2, valor: 74000 },
      { nombre: "PZ HAWAIANA GR", cantidad: 1, valor: 66000, nota: "Valor DERIVADO por diferencia (la foto de la relación viene cortada). $66.000 coincide con el precio histórico del SKU." },
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 2, valor: 63600 },
      { nombre: "PZ HAWAIANA MED", cantidad: 1, valor: 52800 },
      { nombre: "PZ NAPOLITANA GR", cantidad: 1, valor: 38400 },
      { nombre: "HB HAWAIANA", cantidad: 1, valor: 37000 },
      { nombre: "ENSALADA CRISPY CHICK", cantidad: 1, valor: 36000, nota: "SKU nuevo" },
      { nombre: "LASAGNA VEGETARIANA", cantidad: 1, valor: 36000 },
      { nombre: "NACHOS ESPECIALES", cantidad: 1, valor: 36000 },
      { nombre: "PZ MARGARITA MED", cantidad: 1, valor: 36000 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
      { nombre: "NACHOS CLASICOS", cantidad: 1, valor: 31800 },
      { nombre: "PT POLLO BECHAMEL JR", cantidad: 1, valor: 31200 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
      { nombre: "EMPAQUE", cantidad: 2, valor: 4000 },
    ]
  },
  {
    date: "2026-08-07", total: 292400, total_units: 12,
    productos: [
      { nombre: "LASAGNA MIXTA", cantidad: 4, valor: 172000, nota: "Línea única de $172.000 = 4 uds a $43.000" },
      { nombre: "PT CARBONARA RG", cantidad: 1, valor: 38400 },
      { nombre: "HB DE RES CON CHAMPI", cantidad: 1, valor: 36000 },
      { nombre: "ENSALADA GRANJERA", cantidad: 1, valor: 36000 },
      { nombre: "EMPAQUE", cantidad: 5, valor: 10000, nota: "5 empaques a $2.000 — día con alto componente de domicilios/para llevar" },
    ]
  },
  {
    date: "2026-08-08", total: 765600, total_units: 24,
    productos: [
      { nombre: "ALITAS BBQ BUFFALO", cantidad: 8, valor: 254400, nota: "3 líneas de $63.600 (2 uds c/u) + 2 líneas de $31.800" },
      { nombre: "LASAGNA MIXTA", cantidad: 3, valor: 129000, nota: "1 línea de $86.000 (2 uds) + 1 de $43.000" },
      { nombre: "PZ AB ESPECIAL GR", cantidad: 1, valor: 67200 },
      { nombre: "PZ AB CARNES MED", cantidad: 1, valor: 54000 },
      { nombre: "LASAGNA DE RES", cantidad: 1, valor: 40000 },
      { nombre: "PZ AB CARNES PEQ", cantidad: 1, valor: 39600 },
      { nombre: "PT BOLOGNESA RG", cantidad: 1, valor: 38400 },
      { nombre: "HB DE RES", cantidad: 1, valor: 35000 },
      { nombre: "PT CARBONARA JR", cantidad: 1, valor: 31200 },
      { nombre: "PT POLLO BECHAMEL JR", cantidad: 1, valor: 31200 },
      { nombre: "PZ NAPOLITANA PQ", cantidad: 1, valor: 27600 },
      { nombre: "PAPAS A LA FRANCESA", cantidad: 1, valor: 11000 },
      { nombre: "ADIC QUESO", cantidad: 1, valor: 5000 },
      { nombre: "EMPAQUE", cantidad: 1, valor: 2000 },
      { nombre: "PZ MARGARITA MED", cantidad: 1, valor: 0, nota: "🚩 FACTURADA EN $0 (factura A-017940). PVP carta $36.000. SEGUNDA VEZ EN AGOSTO: el 4-ago pasó lo mismo con una PZ POLLO BBQ GR. Ya no es un caso aislado — definir protocolo para cortesías y reposiciones de cocina." },
    ]
  }
];

// ─── Reporte diario de Bar/Coctelería (nuevo desde 25 may 2026) ───
// Productos vendidos en el área de bar, separados en estanco (botellas/sueltos) y cocteles (preparados)
// Cada item tiene precio_unit (PVP) y total para validar con el cuadre. Margen se calcula desde CATALOG cuando hay costo.
// PROMO 2x1 (cerveza + K-cócteles). Días VERIFICADOS matemáticamente: martes (21-jul), MIÉRCOLES (22-jul, 99,74%), viernes (17-jul, 99,5%).
// NO corre sábado/domingo/lunes (18, 19 y 20-jul reconstruidos a PVP completo con 91-102% de precisión).
// Al reconstruir esos días: K-cócteles a $18.000 y cerveza a mitad de carta.
const PRELOADED_BAR = [
  {
    date: "2026-05-25", total_estanco: 46000, total_cocteles: 286000, total: 332000, total_units: 21,
    estanco: [
      { nombre: "CAJA DE VINO", cantidad: 1, precio_unit: 0, total: 0, nota: "PVP pendiente confirmar (posible cortesía/insumo)" },
      { nombre: "CERVEZA NACIONAL", cantidad: 5, precio_unit: 9000, total: 45000 },
      { nombre: "GASEOSA", cantidad: 4, precio_unit: 0, total: 0, nota: "Mezclador (no se cobra) - confirmado 27 may" },
    ],
    cocteles: [
      { nombre: "COPA DE VINO", cantidad: 4, precio_unit: 25000, total: 100000 },
      { nombre: "LIMONADA DE VINO", cantidad: 2, precio_unit: 18000, total: 36000 },
      { nombre: "K ALEXANDER", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MARGARITA MIX", cantidad: 1, precio_unit: 38000, total: 38000 },
      { nombre: "K MARTINI CHOCOLATE", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "SODA ITALIANA", cantidad: 1, precio_unit: 15000, total: 15000 },
      { nombre: "TRAGO DOBLE WHISKYE", cantidad: 1, precio_unit: 25000, total: 25000 },
    ],
    nota: "Estanco $46k: 5 cerveza nacional = $45k. CAJA DE VINO y GASEOSA $0. $1k restante posible cerveza importada parcial o ajuste menor (pendiente revisar)."
  },
  {
    date: "2026-05-26", total_estanco: 110000, total_cocteles: 76000, total: 186000, total_units: 14,
    estanco: [
      { nombre: "AGUA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "CERVEZA NACIONAL", cantidad: 2, precio_unit: 9000, total: 18000 },
      { nombre: "GASEOSA", cantidad: 4, precio_unit: 6000, total: 24000, nota: "Martes 26 sí cobradas a $6k (no como mezclador)" },
      { nombre: "VINO BOTELLA", cantidad: 1, precio_unit: 62000, total: 62000, nota: "PVP confirmado 27 may" },
    ],
    cocteles: [
      { nombre: "K MOJITO MIX", cantidad: 4, precio_unit: 36000, total: 72000, nota: "Promo 2x1 martes/miércoles: 4 vendidos, 2 cobrados a $36k" },
      { nombre: "LIMONADA NATURAL", cantidad: 2, precio_unit: 4000, total: 4000, nota: "Promo 2x1 martes/miércoles: 2 vendidas, 1 cobrada a $4k (precio especial)" },
    ],
    nota: "Promo 2x1 fija martes/miércoles en coctelería. Cuadre: Estanco $110k + Cócteles $76k = $186k. Pago: Efectivo $1k + Nómina Manuel $185k. Faltante $0. Sin pizza, sin gastos."
  },
  {
    date: "2026-05-27", total_estanco: 15000, total_cocteles: 159000, total: 174000, total_units: 13,
    estanco: [
      { nombre: "GASEOSA", cantidad: 2, precio_unit: 6000, total: 12000 },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 3000, total: 3000, nota: "Trago corto ginebra (PVP $3k pendiente confirmar). TEQUILA ML también salió 1 - posible cortesía o trago de coctel" },
    ],
    cocteles: [
      { nombre: "K DAIQUIRI DE FRESAS", cantidad: 2, precio_unit: 36000, total: 36000, nota: "Promo 2x1 miércoles: 2 vendidos, 1 cobrado" },
      { nombre: "K MARGARITA", cantidad: 2, precio_unit: 36000, total: 36000, nota: "Promo 2x1 miércoles: 2 vendidos, 1 cobrado" },
      { nombre: "K MARTINI DRY", cantidad: 2, precio_unit: 36000, total: 36000, nota: "Promo 2x1 miércoles: 2 vendidos, 1 cobrado" },
      { nombre: "K TEQUILA SUNRISE", cantidad: 2, precio_unit: 36000, total: 36000, nota: "Promo 2x1 miércoles: 2 vendidos, 1 cobrado" },
      { nombre: "SODA ITALIANA", cantidad: 1, precio_unit: 15000, total: 15000, nota: "No entra en 2x1" },
    ],
    nota: "Promo 2x1 miércoles. Cócteles: 4 referencias 2x1 (8 vendidos, 4 cobrados @ $36k = $144k) + 1 Soda Italiana $15k = $159k ✓. Estanco $15k: 2 gaseosa $12k + 1 trago $3k. GINEBRA ML y TEQUILA ML salieron 1 c/u en inventario."
  },
  {
    date: "2026-05-28", total_estanco: 42000, total_cocteles: 595000, total: 637000, total_units: 23,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 4, precio_unit: 9000, total: 36000 },
      { nombre: "AGUA", cantidad: 2, precio_unit: 3000, total: 6000, nota: "Agua a $3k (precio confirmado por usuario)" },
    ],
    cocteles: [
      { nombre: "K MARGARITA", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K MARTINI DRY", cantidad: 3, precio_unit: 36000, total: 108000 },
      { nombre: "K MOJITO", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K ULA ULA", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K PECERA LA SALA", cantidad: 2, precio_unit: 69000, total: 138000, nota: "Cóctel grande/compartido (fishbowl). PVP $69k confirmado por cuadre" },
      { nombre: "LICOR DE MANZANA", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "JUGO EN LECHE", cantidad: 2, precio_unit: 13000, total: 26000 },
      { nombre: "JUGO MIX", cantidad: 1, precio_unit: 13000, total: 13000 },
      { nombre: "LIMONADA DE COCO", cantidad: 1, precio_unit: 18000, total: 18000 },
      { nombre: "LIMONADA NATURAL", cantidad: 1, precio_unit: 10000, total: 10000 },
      { nombre: "SODA ITALIANA", cantidad: 2, precio_unit: 15000, total: 30000 },
    ],
    nota: "Jueves SIN promo 2x1 (solo mar/mié). Cócteles cuadran exacto a $595k. Bajas de coctelería (insumos no cobrados aparte): RON DL 2, TRIPLE SEC 1, WHISKY COCT 1, GASEOSA 6 (mezclador). Estanco: 4 cerveza nac $36k + 2 agua $6k = $42k."
  },
  {
    date: "2026-05-29", total_estanco: 1042000, total_cocteles: 2620000, total: 3662000, total_units: 232,
    estanco: [
      { nombre: "MICHELADA", cantidad: 31, precio_unit: 12000, total: 372000, nota: "Cerveza preparada. PVP $12k confirmado. Usa 31 cervezas nacionales" },
      { nombre: "CERVEZA NACIONAL", cantidad: 25, precio_unit: 9000, total: 225000, nota: "Venta directa (56 total - 31 michelada = 25 directas)" },
      { nombre: "CERVEZA CORONA", cantidad: 16, precio_unit: 13000, total: 208000 },
      { nombre: "CERVEZA IMPORTADA", cantidad: 16, precio_unit: 13000, total: 208000 },
      { nombre: "AGUA", cantidad: 5, precio_unit: 6000, total: 30000 },
      { nombre: "AGUA TONICA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "AGTE BOTELLA CAUCANO", cantidad: 2, precio_unit: 0, total: 0, nota: "Botella aguardiente - PVP pendiente" },
      { nombre: "AGTE MEDIA CAUCANO", cantidad: 1, precio_unit: 0, total: 0, nota: "PVP pendiente" },
      { nombre: "RON CALDAS BOTELLA", cantidad: 1, precio_unit: 0, total: 0, nota: "PVP pendiente" },
      { nombre: "RON CALDAS MEDIA", cantidad: 1, precio_unit: 0, total: 0, nota: "PVP pendiente" },
      { nombre: "TRAGO DOBLE", cantidad: 4, precio_unit: 0, total: 0, nota: "Tragos dobles (whisky/aguardiente) - PVP pendiente" },
      { nombre: "GINEBRA ML", cantidad: 2, precio_unit: 0, total: 0, nota: "Tragos - PVP pendiente" },
      { nombre: "TEQUILA ML", cantidad: 3, precio_unit: 0, total: 0, nota: "Tragos - PVP pendiente" },
      { nombre: "VODKA DL", cantidad: 1, precio_unit: 0, total: 0, nota: "Trago - PVP pendiente" },
      { nombre: "RON DL", cantidad: 4, precio_unit: 0, total: 0, nota: "Tragos - PVP pendiente (también insumo cócteles)" },
      { nombre: "ELECTROLIT", cantidad: 1, precio_unit: 0, total: 0, nota: "PVP pendiente" },
    ],
    cocteles: [
      { nombre: "JARRA SANGRIA", cantidad: 7, precio_unit: 90000, total: 630000, nota: "Jarra para compartir. PVP $90k confirmado" },
      { nombre: "K MOJITO", cantidad: 8, precio_unit: 36000, total: 288000 },
      { nombre: "K MARGARITA", cantidad: 7, precio_unit: 36000, total: 252000 },
      { nombre: "K MARGARITA MIX", cantidad: 5, precio_unit: 38000, total: 190000 },
      { nombre: "K TEQUILA SUNRISE", cantidad: 5, precio_unit: 36000, total: 180000 },
      { nombre: "K LONG ISLAND", cantidad: 4, precio_unit: 36000, total: 144000 },
      { nombre: "K PECERA LA SALA", cantidad: 3, precio_unit: 69000, total: 207000, nota: "Fishbowl compartido $69k" },
      { nombre: "K DEMONIO VERDE", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K PINA COLADA SIN LIC", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K BLUE HAWAI", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K COCO LOCO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K GIN TONIC", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MARTINI DRY", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MOJITO MIX", cantidad: 1, precio_unit: 38000, total: 38000 },
      { nombre: "LICOR DE MANZANA", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "LIMONADA DE COCO", cantidad: 4, precio_unit: 18000, total: 72000 },
      { nombre: "LIMONADA NATURAL", cantidad: 3, precio_unit: 10000, total: 30000 },
      { nombre: "LIMONADA DE HIERBABUENA", cantidad: 2, precio_unit: 15000, total: 30000 },
      { nombre: "LIMONADA DE VINO", cantidad: 1, precio_unit: 18000, total: 18000 },
      { nombre: "JUGO EN AGUA", cantidad: 2, precio_unit: 10000, total: 20000 },
      { nombre: "CAJA DE VINO (copas)", cantidad: 6, precio_unit: 0, total: 0, nota: "6 copas servidas de 1 caja física (Caja de Vino inventario -1). Posible Copa de Vino $25k c/u" },
    ],
    nota: "Viernes 29 día MASIVO ($4.858.000 venta total). SIN promo 2x1 (solo mar/mié). Estanco con michelada (31) suma ~$1.049k vs $1.042k cuadre (dif menor por PVP tragos pendientes). Cócteles K + jarra sangría + limonadas. PRECIOS PENDIENTES: tragos cortos (ginebra/tequila/vodka ML, ron DL, trago doble), aguardientes botella/media, copas de vino, electrolit. Cantidades 100% validadas contra inventario."
  },
  {
    date: "2026-05-30", total_estanco: 399000, total_cocteles: 487000, total: 886000, total_units: 31,
    estanco: [
      { nombre: "AGTE BOTELLA CAUCANO", cantidad: 4, precio_unit: 90000, total: 360000, nota: "4 botellas Aguardiente Caucano Tradicional (carta $90k botella)" },
      { nombre: "CERVEZA NACIONAL", cantidad: 3, precio_unit: 9000, total: 27000 },
      { nombre: "AGUA", cantidad: 2, precio_unit: 6000, total: 12000 },
    ],
    cocteles: [
      { nombre: "JARRA SANGRIA", cantidad: 1, precio_unit: 95000, total: 95000, nota: "Sangría 50oz (carta pág 13)" },
      { nombre: "COPA DE SANGRIA", cantidad: 12, precio_unit: 7500, total: 90000, nota: "Copa individual de sangría (porción; deriva del jarra $95k)" },
      { nombre: "K CAIPIRINHA", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MEXICO LINDO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K NUBARRON", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K OLD FASHION", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K TEQUILA SUNRISE", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MOJITO MIX", cantidad: 1, precio_unit: 38000, total: 38000 },
      { nombre: "LICOR DE MANZANA", cantidad: 2, precio_unit: 36000, total: 72000, nota: "Cóctel (consistente con 28/29 may)" },
      { nombre: "MICHELADA", cantidad: 1, precio_unit: 12000, total: 12000 },
    ],
    nota: "Sábado 30. Cruce con carta exacto: Estanco $399k (4 aguardiente caucano $90k + 3 cerveza nac $9k + 2 agua $6k) y Cócteles $487k. Bajas/insumos no cobrados: GASEOSA 2 (mezclador; inv consumió 12), CAJA DE VINO 2 + VINO BOTELLA 1 (base sangría), TEQUILA ML 1, TRIPLE SEC 1. Copa de sangría $7.5k derivada (residual exacto)."
  },
  {
    date: "2026-06-01", total_estanco: 144000, total_cocteles: 208000, total: 352000, total_units: 56,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 15, precio_unit: 9000, total: 135000, nota: "Venta directa: 18 bajas inv − 3 michelada = 15. PVP estándar $9k" },
      { nombre: "MICHELADA", cantidad: 3, precio_unit: 12000, total: 36000, nota: "Cerveza preparada; usa 3 cerveza nacional. PVP $12k" },
      { nombre: "CERVEZA IMPORTADA", cantidad: 2, precio_unit: 13000, total: 26000 },
      { nombre: "AGUA", cantidad: 2, precio_unit: 6000, total: 12000 },
      { nombre: "AGTE MEDIA ANTIOQUEÑO", cantidad: 2, precio_unit: 60000, total: 120000, nota: "2 medias baja inv. ¿Vendidas como media ($60k) o tragos? PVP/clasificación PENDIENTE" },
      { nombre: "GINEBRA DL", cantidad: 1, precio_unit: 0, total: 0, nota: "Trago/insumo - PVP pendiente" },
      { nombre: "GASEOSA", cantidad: 17, precio_unit: 0, total: 0, nota: "Mezclador cócteles (cuba libre/mojito/soda), no cobrado aparte" },
      { nombre: "GASEOSA 1.5", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo/mezclador" },
    ],
    cocteles: [
      { nombre: "K MOJITO", cantidad: 6, precio_unit: 36000, total: 216000 },
      { nombre: "K CUBA LIBRE", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "SODA ITALIANA", cantidad: 4, precio_unit: 15000, total: 60000 },
      { nombre: "LIMONADA DE COCO", cantidad: 1, precio_unit: 18000, total: 18000 },
    ],
    nota: "Lunes 01 jun. CANTIDADES 100% validadas (bajas directas = columna Sal del inventario; cócteles del reporte BAR). ⚠️ PRECIOS/CLASIFICACIÓN A CONFIRMAR: a PVP estándar el valor sería ~$695k (estanco ~$329k + cócteles ~$366k), pero el cuadre dice Estanco $144k + Cócteles $208k = $352k (≈ la mitad). Esto apunta a (a) promo 2x1 / descuento fuerte un lunes flojo, y/o (b) cortesías/consumo de personal en cervezas, y/o (c) las 2 AGTE MEDIA fueron baja de inventario y no venta. El cuadre ($144k/$208k) es la fuente de verdad para finanzas; el detalle por ítem se refina cuando Juanma confirme. Sin promo fija lunes (2x1 es solo mar/mié)."
  },
  {
    date: "2026-06-02", total_estanco: 31000, total_cocteles: 134000, total: 165000, total_units: 16,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 5, precio_unit: 9000, total: 45000, nota: "5 bajas inv validadas. A PVP $45k supera el estanco $31k del cuadre → parte cortesía/no cobrada o precio promo; mix exacto pendiente" },
      { nombre: "AGUA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "GASEOSA", cantidad: 2, precio_unit: 0, total: 0, nota: "Mezclador cócteles, no cobrado aparte" },
    ],
    cocteles: [
      { nombre: "K MOJITO", cantidad: 4, precio_unit: 36000, total: 72000, nota: "Promo 2x1 martes: 4 vendidos, 2 cobrados" },
      { nombre: "K MARGARITA MIX", cantidad: 2, precio_unit: 38000, total: 38000, nota: "Promo 2x1 martes: 2 vendidos, 1 cobrado" },
      { nombre: "SODA ITALIANA", cantidad: 1, precio_unit: 15000, total: 15000, nota: "No entra en 2x1" },
      { nombre: "LIMONADA NATURAL", cantidad: 1, precio_unit: 9000, total: 9000, nota: "Residual exacto del cuadre ($134k − $125k). PVP usual $10k - confirmar" },
    ],
    nota: "Martes 02 jun CON promo 2x1. Cócteles cuadran EXACTO a $134k: K Mojito 4→2 cobrados $72k + K Margarita Mix 2→1 cobrado $38k + Soda Italiana $15k + Limonada Natural $9k (residual). Estanco $31k vs $51k a PVP (5 cervezas $45k + 1 agua $6k): mix exacto pendiente. Bajas 100% validadas contra inventario (agua 1, cerveza nac 5, gaseosa 2). REPOSICIÓN coctelería entró en inventario: Ginebra ML +3, Licor de Manzana +4, Tequila ML +6, Triple Sec +2 (factura/pago pendiente de registrar en Compras)."
  },
  {
    date: "2026-06-03", total_estanco: 533000, total_cocteles: 350000, total: 883000, total_units: 74,
    estanco: [
      { nombre: "CERVEZA CORONA", cantidad: 16, precio_unit: 13000, total: 208000 },
      { nombre: "CERVEZA NACIONAL", cantidad: 18, precio_unit: 9000, total: 162000, nota: "Venta directa: 19 bajas inv − 1 michelada = 18" },
      { nombre: "CERVEZA IMPORTADA", cantidad: 10, precio_unit: 13000, total: 130000 },
      { nombre: "MICHELADA", cantidad: 1, precio_unit: 12000, total: 12000, nota: "Cerveza preparada; usa 1 cerveza nacional" },
      { nombre: "AGUA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 3000, total: 3000, nota: "Trago corto - PVP pendiente" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 3000, total: 3000, nota: "Trago corto - PVP pendiente" },
      { nombre: "GASEOSA", cantidad: 5, precio_unit: 0, total: 0, nota: "Mezclador cócteles, no cobrado aparte" },
    ],
    cocteles: [
      { nombre: "K TEQUILA SUNRISE", cantidad: 6, precio_unit: 36000, total: 108000, nota: "Promo 2x1 miércoles: 6 vendidos, 3 cobrados" },
      { nombre: "K BLUE SKY", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1: 2 vendidos, 1 cobrado. PVP especialidad por confirmar" },
      { nombre: "K CAIPIRINHA", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1: 2 vendidos, 1 cobrado" },
      { nombre: "K DULCE EMBRUJO", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1: 2 vendidos, 1 cobrado. PVP especialidad por confirmar" },
      { nombre: "K MARGARITA MIX", cantidad: 2, precio_unit: 38000, total: 38000, nota: "2x1: 2 vendidos, 1 cobrado" },
      { nombre: "K MARTINI DRY", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1: 2 vendidos, 1 cobrado" },
      { nombre: "K MOJITO", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1: 2 vendidos, 1 cobrado" },
      { nombre: "LIMONADA NATURAL", cantidad: 3, precio_unit: 8000, total: 24000, nota: "Residual exacto del cuadre ($350k − $326k). PVP/promo por confirmar" },
    ],
    nota: "Miércoles 03 jun CON promo 2x1 (día fuerte). Estanco reconcilia BIEN: ~$524k a PVP vs $533k del cuadre (residual ~$9k, probablemente PVP de los 2 tragos ML). Cócteles forzados a $350k del cuadre: 9 cobrados con 2x1 + limonada residual; PVP de especialidades (Blue Sky, Dulce Embrujo) por confirmar. Bajas directas 100% validadas contra inventario. REPOSICIÓN aguardiente entró: AGTE Botella Antioqueño +6, AGTE Media Antioqueño +2 (factura/pago pendiente de registrar)."
  },
  {
    date: "2026-06-04", total_estanco: 232000, total_cocteles: 118000, total: 350000, total_units: 30,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 8, precio_unit: 9000, total: 72000, nota: "Venta directa: 13 bajas inv − 5 michelada = 8" },
      { nombre: "CERVEZA CORONA", cantidad: 5, precio_unit: 13000, total: 65000 },
      { nombre: "MICHELADA", cantidad: 5, precio_unit: 12000, total: 60000, nota: "Cerveza preparada; usa 5 cerveza nacional" },
      { nombre: "AGTE MEDIA ANTIOQUEÑO", cantidad: 1, precio_unit: 29000, total: 29000, nota: "Residual exacto del cuadre. Sugiere PVP media ≈$29k — confirmar (relevante también para el 1 jun)" },
      { nombre: "AGUA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "GASEOSA", cantidad: 2, precio_unit: 0, total: 0, nota: "Mezclador, no cobrado aparte" },
    ],
    cocteles: [
      { nombre: "K MARGARITA", cantidad: 2, precio_unit: 38000, total: 76000, nota: "Jueves sin 2x1: ambas cobradas" },
      { nombre: "K MARTINI DRY", cantidad: 1, precio_unit: 36000, total: 36000 },
    ],
    nota: "Jueves 04 jun SIN promo (2x1 solo mar/mié). Estanco reconcilia casi exacto: 8 cerveza nac $72k + 5 corona $65k + 5 michelada $60k + 1 agua $6k + 1 AGTE media (residual $29k) = $232k del cuadre. Cócteles: K Margarita 2 + K Martini Dry 1 = $112k a PVP vs $118k del cuadre (residual $6k por confirmar). Bajas 100% validadas contra inventario."
  },
  {
    date: "2026-06-05", total_estanco: 1342000, total_cocteles: 655000, total: 1997000, total_units: 139,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 52, precio_unit: 9000, total: 468000, nota: "Venta directa: 61 bajas inv − 9 michelada = 52" },
      { nombre: "AGTE BOTELLA ANTIOQUEÑO", cantidad: 5, precio_unit: 116600, total: 583000, nota: "5 botellas (mesa). RESIDUAL del cuadre → PVP botella ≈$116.600 POR CONFIRMAR (dominante en el estanco del día)" },
      { nombre: "MICHELADA", cantidad: 9, precio_unit: 12000, total: 108000, nota: "Usa 9 cerveza nacional" },
      { nombre: "CERVEZA CORONA", cantidad: 7, precio_unit: 13000, total: 91000 },
      { nombre: "CERVEZA IMPORTADA", cantidad: 3, precio_unit: 13000, total: 39000 },
      { nombre: "AGTE MEDIA CAUCANO", cantidad: 1, precio_unit: 29000, total: 29000, nota: "PVP media ≈$29k por confirmar" },
      { nombre: "AGUA", cantidad: 3, precio_unit: 6000, total: 18000 },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 3000, total: 3000, nota: "Trago - PVP pendiente" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 3000, total: 3000, nota: "Trago - PVP pendiente" },
      { nombre: "AGUA TONICA", cantidad: 5, precio_unit: 0, total: 0, nota: "Mezclador de los gin tonic, no cobrado aparte" },
      { nombre: "GASEOSA", cantidad: 29, precio_unit: 0, total: 0, nota: "Mezclador cócteles, no cobrado aparte" },
    ],
    cocteles: [
      { nombre: "K GIN TONIC", cantidad: 6, precio_unit: 36000, total: 216000 },
      { nombre: "K MOJITO", cantidad: 3, precio_unit: 36000, total: 108000 },
      { nombre: "K MARGARITA", cantidad: 2, precio_unit: 38000, total: 76000 },
      { nombre: "K ACAPULCO", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Cóctel nuevo - PVP por confirmar" },
      { nombre: "K COCO LOCO", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Cóctel nuevo - PVP por confirmar" },
      { nombre: "K DAIQUIRI DE FRESAS", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Cóctel nuevo - PVP por confirmar" },
      { nombre: "K MEXICO LINDO", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Cóctel nuevo - PVP por confirmar" },
      { nombre: "LIMONADA DE COCO", cantidad: 2, precio_unit: 18000, total: 36000 },
      { nombre: "LIMONADA NATURAL", cantidad: 2, precio_unit: 10000, total: 20000 },
      { nombre: "SODA ITALIANA", cantidad: 1, precio_unit: 15000, total: 15000 },
      { nombre: "LIMONADA DE HIERBABUENA", cantidad: 1, precio_unit: 15000, total: 15000, nota: "PVP estimado (residual)" },
      { nombre: "JUGO EN LECHE", cantidad: 1, precio_unit: 15000, total: 15000, nota: "PVP estimado (residual)" },
      { nombre: "AROMATICA DE FRUTA", cantidad: 1, precio_unit: 10000, total: 10000, nota: "PVP estimado (residual)" },
    ],
    nota: "Viernes 05 jun SIN promo (día fuerte). Cócteles cuadran EXACTO a $655k con K's a $36k (margarita $38k) + limonadas/bebidas. Estanco $1.342k: lo dominan 5 botellas Antioqueño (residual ~$583k → PVP botella ≈$116.6k POR CONFIRMAR) + 52 cerveza nac + 9 michelada + corona/importada. Aparecen cócteles NUEVOS (Acapulco, Coco Loco, Daiquiri Fresas, Mexico Lindo, Gin Tonic, limonada hierbabuena, jugo en leche, aromática) — PVP asumidos, confirmar. Bajas 100% validadas contra inventario. REPOSICIÓN cerveza entró: Corona +24, Nacional +90 (factura/pago pendiente de registrar)."
  },
  {
    date: "2026-06-06", total_estanco: 704000, total_cocteles: 980000, total: 1684000, total_units: 126,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 33, precio_unit: 9000, total: 297000, nota: "46 bajas inv − 13 michelada = 33. A PVP supera el estanco del cuadre → cortesías/consumo interno (sábado fuerte)" },
      { nombre: "MICHELADA", cantidad: 13, precio_unit: 12000, total: 156000, nota: "Usa 13 cerveza nacional" },
      { nombre: "CERVEZA IMPORTADA", cantidad: 12, precio_unit: 13000, total: 156000 },
      { nombre: "CERVEZA CORONA", cantidad: 9, precio_unit: 13000, total: 117000 },
      { nombre: "AGTE BOTELLA CAUCANO", cantidad: 1, precio_unit: 90000, total: 90000, nota: "PVP botella por confirmar" },
      { nombre: "TRAGO DOBLE WHISKYE", cantidad: 2, precio_unit: 20000, total: 40000, nota: "Usa 1 whisky coctelería; PVP por confirmar" },
      { nombre: "AGTE MEDIA ANTIOQUEÑO", cantidad: 1, precio_unit: 29000, total: 29000 },
      { nombre: "TEQUILA ML", cantidad: 2, precio_unit: 3000, total: 6000, nota: "Tragos - PVP pendiente" },
      { nombre: "AGUA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 3000, total: 3000, nota: "Trago - PVP pendiente" },
      { nombre: "RON CALDAS MED", cantidad: 2, precio_unit: 0, total: 0, nota: "Base de cóctel/trago - no cobrado aparte" },
      { nombre: "TRIPLE SEC", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo cóctel" },
      { nombre: "LICOR DE MANZANA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo cóctel" },
      { nombre: "GASEOSA", cantidad: 17, precio_unit: 0, total: 0, nota: "Mezclador, no cobrado aparte" },
    ],
    cocteles: [
      { nombre: "K MOJITO", cantidad: 8, precio_unit: 36000, total: 288000 },
      { nombre: "K MARGARITA", cantidad: 6, precio_unit: 38000, total: 228000 },
      { nombre: "K MEDUSA", cantidad: 4, precio_unit: 36000, total: 144000, nota: "Cóctel nuevo - PVP por confirmar" },
      { nombre: "K MOJITO MIX", cantidad: 1, precio_unit: 38000, total: 38000 },
      { nombre: "K CAIPIRINHA", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K ENERGY", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Cóctel nuevo - PVP por confirmar" },
      { nombre: "K ORGASMO MULTIPLE", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Cóctel nuevo - PVP por confirmar" },
      { nombre: "K PIÑA COLADA CON LIC", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Cóctel nuevo - PVP por confirmar" },
      { nombre: "K PUMPKIN PIE", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Cóctel nuevo - PVP por confirmar" },
      { nombre: "K SPACEBOOM", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Cóctel nuevo - PVP por confirmar" },
      { nombre: "K WHITE SKY", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Cóctel nuevo - PVP por confirmar" },
      { nombre: "LIMONADA NATURAL", cantidad: 3, precio_unit: 6000, total: 18000, nota: "PVP residual por confirmar" },
      { nombre: "LIMONADA DE VINO", cantidad: 1, precio_unit: 12000, total: 12000, nota: "PVP residual por confirmar" },
    ],
    nota: "Sábado 06 jun SIN promo (noche fuerte de coctelería). Cócteles cuadran EXACTO a $980k con K's a $36k (margarita/mix $38k) + limonadas residuales. MUCHOS cócteles nuevos de la carta (Medusa, Energy, Orgasmo Múltiple, Piña Colada, Pumpkin Pie, Spaceboom, White Sky) — PVP asumidos a $36k, CONFIRMAR. Estanco $704k del cuadre vs ~$900k a PVP (33 cerveza nac + 13 michelada + importada/corona + aguardiente): gap ~$196k = cortesías/consumo interno de una noche llena. Bajas 100% validadas contra inventario. REPOSICIÓN cerveza fuerte entró: Nacional +180, Corona +24, Importada +16 (factura/pago pendiente de registrar)."
  },
  {
    date: "2026-06-07", total_estanco: 445000, total_cocteles: 714000, total: 1159000, total_units: 94,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 29, precio_unit: 9000, total: 261000, nota: "40 bajas inv − 11 michelada = 29. A PVP supera el estanco del cuadre → cortesías/consumo interno (domingo)" },
      { nombre: "MICHELADA", cantidad: 11, precio_unit: 12000, total: 132000, nota: "Usa 11 cerveza nacional" },
      { nombre: "CERVEZA CORONA", cantidad: 8, precio_unit: 13000, total: 104000 },
      { nombre: "CERVEZA IMPORTADA", cantidad: 2, precio_unit: 13000, total: 26000 },
      { nombre: "AGUA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 3000, total: 3000, nota: "Trago - PVP pendiente" },
      { nombre: "GASEOSA", cantidad: 12, precio_unit: 0, total: 0, nota: "Mezclador, no cobrado aparte" },
    ],
    cocteles: [
      { nombre: "K MOJITO", cantidad: 7, precio_unit: 36000, total: 252000 },
      { nombre: "K FROZEN GRANIZADO", cantidad: 4, precio_unit: 36000, total: 144000, nota: "Cóctel granizado - PVP por confirmar" },
      { nombre: "LIMONADA DE COCO", cantidad: 3, precio_unit: 18000, total: 54000 },
      { nombre: "K CONGA", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Cóctel nuevo - PVP por confirmar" },
      { nombre: "K OLD FASHION", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Cóctel nuevo - PVP por confirmar" },
      { nombre: "K WHITE SKY", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "LIMONADA NATURAL", cantidad: 3, precio_unit: 10000, total: 30000 },
      { nombre: "SODA ITALIANA", cantidad: 2, precio_unit: 15000, total: 30000 },
      { nombre: "COPA DE VINO", cantidad: 3, precio_unit: 10000, total: 30000, nota: "PVP por confirmar" },
      { nombre: "VINO BOTELLA", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Botella vendida; PVP por confirmar" },
      { nombre: "RESERVA", cantidad: 1, precio_unit: 15000, total: 15000, nota: "Ítem por identificar/confirmar" },
      { nombre: "LIMONADA CEREZADA", cantidad: 1, precio_unit: 10000, total: 10000, nota: "PVP residual por confirmar" },
      { nombre: "JUGO EN AGUA", cantidad: 1, precio_unit: 5000, total: 5000, nota: "PVP residual por confirmar" },
    ],
    nota: "Domingo 07 jun SIN promo. Cócteles cuadran EXACTO a $714k con K's a $36k + limonadas/vino/bebidas (varios PVP residuales por confirmar: Frozen Granizado, Conga, Old Fashion, Reserva, copa/botella de vino). Estanco $445k del cuadre vs ~$532k a PVP (29 cerveza nac + 11 michelada + corona/importada): gap ~$87k = cortesías/consumo interno. Bajas 100% validadas contra inventario. REPOSICIÓN entró: AGTE Media Caucano +4, Ron Caldas Media +2 (factura/pago pendiente). [Corregido: el saldo de Cerveza Nacional cierra en 224 (264 − 40 vendidas, sin entrada ese día), confirmado por el inventario inicial del 8 jun.]"
  },
  {
    date: "2026-06-08", total_estanco: 37000, total_cocteles: 535000, total: 572000, total_units: 26,
    estanco: [
      { nombre: "CERVEZA IMPORTADA", cantidad: 1, precio_unit: 13000, total: 13000 },
      { nombre: "AGUA TONICA", cantidad: 3, precio_unit: 5000, total: 15000, nota: "Cobrada directa (no como mezclador) - cuadra estanco exacto" },
      { nombre: "AGUA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 3000, total: 3000, nota: "Trago - PVP pendiente" },
      { nombre: "GASEOSA", cantidad: 6, precio_unit: 0, total: 0, nota: "Mezclador, no cobrado aparte" },
    ],
    cocteles: [
      { nombre: "K PECERA LA SALA", cantidad: 3, precio_unit: 95000, total: 285000, nota: "Formato pecera. PVP $95k CONFIRMADO por cuadre exacto del día" },
      { nombre: "K GIN TONIC", cantidad: 3, precio_unit: 36000, total: 108000 },
      { nombre: "K DESTORNILLADOR", cantidad: 2, precio_unit: 36000, total: 72000, nota: "Cóctel nuevo - PVP por confirmar" },
      { nombre: "LIMONADA DE COCO", cantidad: 2, precio_unit: 18000, total: 36000 },
      { nombre: "SODA ITALIANA", cantidad: 2, precio_unit: 15000, total: 30000 },
      { nombre: "JUGO EN AGUA", cantidad: 1, precio_unit: 4000, total: 4000, nota: "PVP residual por confirmar" },
      { nombre: "LICOR DE MANZANA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo de cóctel - no cobrado aparte" },
    ],
    nota: "Lunes 08 jun SIN promo. Estanco $37k cuadra EXACTO (1 importada $13k + 3 agua tónica $15k + 1 agua $6k + 1 ginebra ML $3k). Cócteles $535k cuadran EXACTO con 3 K Pecera La Sala a $95k + gin tonic + destornillador + limonadas/jugo → CONFIRMA el PVP de la Pecera en $95.000 (resuelve la duda $69k vs $95k). Bajas 100% validadas contra inventario. Día sin venta de cerveza nacional (Cerveza Nacional saldo 224 sin cambio)."
  },
  {
    date: "2026-06-09", total_estanco: 40000, total_cocteles: 213000, total: 253000, total_units: 24,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 3, precio_unit: 9000, total: 27000 },
      { nombre: "RED BULL", cantidad: 1, precio_unit: 13000, total: 13000, nota: "PVP residual por confirmar" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo/trago - no cobrado aparte (estanco cuadra exacto sin él)" },
      { nombre: "GASEOSA", cantidad: 5, precio_unit: 0, total: 0, nota: "Mezclador" },
    ],
    cocteles: [
      { nombre: "K MARGARITA", cantidad: 6, precio_unit: 38000, total: 114000, nota: "2x1 martes: 3 cobradas de 6" },
      { nombre: "K COCO LOCO", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1 martes: 1 cobrada de 2" },
      { nombre: "K MEXICO LINDO", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1 martes: 1 cobrada de 2" },
      { nombre: "SODA ITALIANA", cantidad: 1, precio_unit: 15000, total: 15000 },
      { nombre: "LIMONADA NATURAL", cantidad: 3, precio_unit: 4000, total: 12000 },
    ],
    nota: "Martes 09 jun CON promo 2x1 en cócteles K. Estanco $40k cuadra EXACTO (3 cerveza nacional $27k + 1 red bull $13k). Cócteles $213k cuadran EXACTO aplicando 2x1 a Margarita/Coco Loco/Mexico Lindo + soda + limonadas. Bajas validadas. REPOSICIÓN entró: Tequila ML +6, Ginebra ML +3 (factura/pago pendiente)."
  },
  {
    date: "2026-06-10", total_estanco: 387000, total_cocteles: 1122000, total: 1509000, total_units: 95,
    estanco: [
      { nombre: "AGTE BOTELLA ANTIOQUEÑO", cantidad: 2, precio_unit: 58000, total: 116000, nota: "Botella - PVP derivado por residual, por confirmar con carta" },
      { nombre: "AGTE BOTELLA CAUCANO", cantidad: 1, precio_unit: 53000, total: 53000, nota: "Botella - PVP derivado por residual, por confirmar" },
      { nombre: "CERVEZA CORONA", cantidad: 10, precio_unit: 12000, total: 120000 },
      { nombre: "CERVEZA NACIONAL", cantidad: 4, precio_unit: 9000, total: 36000 },
      { nombre: "RON DL", cantidad: 2, precio_unit: 12000, total: 24000 },
      { nombre: "AGUA", cantidad: 2, precio_unit: 6000, total: 12000 },
      { nombre: "AGUA TONICA", cantidad: 2, precio_unit: 5000, total: 10000 },
      { nombre: "TRIPLE SEC", cantidad: 1, precio_unit: 10000, total: 10000 },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 3000, total: 3000 },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 3000, total: 3000 },
      { nombre: "WHISKY COCT", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería (entró 1 hoy, $84k Catay)" },
      { nombre: "GASEOSA", cantidad: 10, precio_unit: 0, total: 0, nota: "Mezclador" },
    ],
    cocteles: [
      { nombre: "K GIN TONIC", cantidad: 10, precio_unit: 36000, total: 180000, nota: "2x1: 5 cobradas de 10" },
      { nombre: "K MARGARITA", cantidad: 5, precio_unit: 38000, total: 114000, nota: "2x1: 3 cobradas de 5" },
      { nombre: "K COSMOPOLITAN", cantidad: 4, precio_unit: 36000, total: 72000, nota: "2x1: 2 de 4" },
      { nombre: "K BLUE SKY", cantidad: 4, precio_unit: 36000, total: 72000, nota: "2x1: 2 de 4" },
      { nombre: "K MARTINI DRY", cantidad: 4, precio_unit: 36000, total: 72000, nota: "2x1: 2 de 4" },
      { nombre: "K MOJITO", cantidad: 4, precio_unit: 36000, total: 72000, nota: "2x1: 2 de 4" },
      { nombre: "K SUEÑO ROSA", cantidad: 4, precio_unit: 36000, total: 72000, nota: "2x1: 2 de 4" },
      { nombre: "K ACAPULCO", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1: 1 de 2" },
      { nombre: "K CAIPIRINHA", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1: 1 de 2" },
      { nombre: "K COCO LOCO", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1: 1 de 2" },
      { nombre: "K DAIQUIRI DE FRESAS", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1: 1 de 2" },
      { nombre: "K DEMONIO VERDE", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1: 1 de 2" },
      { nombre: "K ENERGY", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1: 1 de 2" },
      { nombre: "K MARGARITA MIX", cantidad: 2, precio_unit: 38000, total: 38000, nota: "2x1: 1 de 2" },
      { nombre: "K OLD FASHION", cantidad: 1, precio_unit: 36000, total: 36000, nota: "PVP por confirmar" },
      { nombre: "K TEQUILA SUNRISE", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "SODA ITALIANA", cantidad: 3, precio_unit: 15000, total: 45000 },
      { nombre: "RESERVA", cantidad: 2, precio_unit: 40000, total: 80000, nota: "PVP derivado por residual, por confirmar" },
      { nombre: "JUGO MIX", cantidad: 2, precio_unit: 8500, total: 17000, nota: "PVP derivado por residual, por confirmar" },
    ],
    nota: "Miércoles 10 jun CON promo 2x1 en cócteles K - NOCHE GRANDE ($1.509.000 en bar). Cócteles $1.122.000 cuadran EXACTO aplicando 2x1 a las 16 referencias K + soda/reserva/jugo mix. Estanco $387k cuadra EXACTO pero OJO: las 3 botellas de aguardiente (2 antioqueño + 1 caucano) se valoraron por residual (~$58k/$53k) - PVP de botella por confirmar con la carta. Reserva y Jugo Mix también derivados. Bajas validadas contra inventario. REPOSICIÓN entró: Whisky Coctelería +1 ($84k Catay). Continuidad inventario inicial 10 = final 09 CONFIRMA Ginebra ML 4 y Tequila ML 6 (lecturas del 9 correctas)."
  },
  {
    date: "2026-06-11", total_estanco: 91000, total_cocteles: 383000, total: 522000, total_units: 31,
    estanco: [
      { nombre: "CERVEZA CORONA", cantidad: 4, precio_unit: 12000, total: 48000 },
      { nombre: "CERVEZA NACIONAL", cantidad: 4, precio_unit: 9000, total: 36000 },
      { nombre: "AGUA", cantidad: 2, precio_unit: 3500, total: 7000, nota: "PVP ajustado para cuadrar estanco exacto" },
      { nombre: "GASEOSA", cantidad: 4, precio_unit: 0, total: 0, nota: "Mezclador" },
    ],
    cocteles: [
      { nombre: "K DAIQUIRI DE FRESAS", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K TOM COLLINS", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K APPLE MARTINI", cantidad: 1, precio_unit: 36000, total: 36000, nota: "PVP por confirmar" },
      { nombre: "K BURBUJAS AZULES", cantidad: 1, precio_unit: 36000, total: 36000, nota: "PVP por confirmar" },
      { nombre: "K MARTINI DRY", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K OLD FASHION", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K TEQUILA SUNRISE", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "SHOT", cantidad: 6, precio_unit: 7000, total: 42000, nota: "PVP derivado por residual, por confirmar" },
      { nombre: "JUGO EN AGUA", cantidad: 4, precio_unit: 3250, total: 13000, nota: "PVP derivado por residual" },
      { nombre: "LIMONADA NATURAL", cantidad: 1, precio_unit: 4000, total: 4000 },
    ],
    nota: "Jueves 11 jun SIN promo (2x1 es solo martes/miércoles). Cuadre trae línea OTROS $48.000 = 4 MICHELADAS ($12k c/u) - registradas en otros_venta del cuadre, no en estanco/cócteles. Inventario: bajan 4 corona + 4 nacional (8 cervezas): 4 a micheladas + 4 a venta directa. Estanco $91k y cócteles $383k cuadran EXACTO. SHOT ($7k) y Jugo en Agua ($3.25k) derivados por residual. Bajas validadas: Agua 28, Corona 18, Nacional 213, Gaseosa 123. Sin reposición."
  },
  {
    date: "2026-06-12", total_estanco: 325000, total_cocteles: 488000, total: 813000, total_units: 56,
    estanco: [
      { nombre: "AGTE BOTELLA REAL", cantidad: 1, precio_unit: 90000, total: 90000, nota: "Botella aguardiente Real - PVP derivado por residual, por confirmar" },
      { nombre: "CERVEZA NACIONAL", cantidad: 10, precio_unit: 9000, total: 90000 },
      { nombre: "CERVEZA CORONA", cantidad: 5, precio_unit: 12000, total: 60000 },
      { nombre: "RON CALDAS MEDIA", cantidad: 1, precio_unit: 25000, total: 25000, nota: "Media botella - PVP derivado por residual" },
      { nombre: "MICHELADA", cantidad: 2, precio_unit: 12000, total: 24000, nota: "En estanco (este día Otros del cuadre = 0)" },
      { nombre: "TRAGO DOBLE WHISKY", cantidad: 1, precio_unit: 19000, total: 19000, nota: "PVP derivado por residual" },
      { nombre: "AGUA", cantidad: 2, precio_unit: 6000, total: 12000 },
      { nombre: "AGUA TONICA", cantidad: 1, precio_unit: 5000, total: 5000 },
      { nombre: "GASEOSA", cantidad: 12, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "GASEOSA 1.5", cantidad: 2, precio_unit: 0, total: 0, nota: "Mezclador" },
    ],
    cocteles: [
      { nombre: "K MARGARITA", cantidad: 3, precio_unit: 38000, total: 114000 },
      { nombre: "K ACAPULCO", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K CUBA LIBRE", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K MOJITO", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K FROZEN GRANIZADO", cantidad: 1, precio_unit: 48000, total: 48000, nota: "Granizado premium - PVP $48k confirma cuadre exacto" },
      { nombre: "K COCO LOCO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K GIN TONIC", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MOJITO MIX", cantidad: 1, precio_unit: 38000, total: 38000 },
    ],
    nota: "Viernes 12 jun SIN promo. Estanco $325k cuadra EXACTO (incluye botella Aguardiente Real ~$90k, Ron Caldas media ~$25k, Trago doble whisky ~$19k - derivados por residual, por confirmar con carta). 2 Micheladas en estanco (hoy Otros del cuadre = 0, distinto al 11 jun). Cócteles $488k cuadran EXACTO con K Frozen Granizado a $48k (premium). Bajas validadas: Agt Real 0, Agua 26, Corona 13, Nacional 203, Gaseosa 111, Ron Caldas Med 1, Tequila ML 3 (sin baja: los cócteles con tequila usaron botella abierta). Sin reposición."
  },
  {
    date: "2026-06-13", total_estanco: 55000, total_cocteles: 1008000, total: 1063000, total_units: 80,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 3, precio_unit: 9000, total: 27000 },
      { nombre: "CERVEZA IMPORTADA", cantidad: 1, precio_unit: 13000, total: 13000 },
      { nombre: "CHISCAKE", cantidad: 1, precio_unit: 10000, total: 10000, nota: "Postre - PVP derivado" },
      { nombre: "AROMATICA DE FRUTA", cantidad: 1, precio_unit: 5000, total: 5000, nota: "PVP derivado" },
    ],
    cocteles: [
      { nombre: "K MOJITO", cantidad: 9, precio_unit: 36000, total: 324000 },
      { nombre: "K MARGARITA", cantidad: 5, precio_unit: 38000, total: 190000 },
      { nombre: "K FROZEN GRANIZADO", cantidad: 1, precio_unit: 48000, total: 48000 },
      { nombre: "K DULCE EMBRUJO", cantidad: 1, precio_unit: 36000, total: 36000, nota: "PVP por confirmar" },
      { nombre: "K MEXICO LINDO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "SODA ITALIANA", cantidad: 4, precio_unit: 15000, total: 60000 },
      { nombre: "LIMONADA DE VINO", cantidad: 4, precio_unit: 12000, total: 48000, nota: "PVP derivado" },
      { nombre: "JARRA SANGRIA", cantidad: 1, precio_unit: 45000, total: 45000, nota: "Jarra - PVP derivado por residual" },
      { nombre: "RESERVA", cantidad: 1, precio_unit: 40000, total: 40000, nota: "PVP derivado" },
      { nombre: "RON CALDAS BOTELLA", cantidad: 1, precio_unit: 30000, total: 30000, nota: "PVP derivado por residual, por confirmar" },
      { nombre: "MICHELADA", cantidad: 2, precio_unit: 12000, total: 24000 },
      { nombre: "RON CALDAS MEDIA", cantidad: 1, precio_unit: 25000, total: 25000, nota: "PVP derivado" },
      { nombre: "CAJA DE VINO", cantidad: 1, precio_unit: 25000, total: 25000, nota: "PVP derivado por residual" },
      { nombre: "TRAGO DOBLE WHISKY", cantidad: 1, precio_unit: 19000, total: 19000, nota: "PVP derivado" },
      { nombre: "LIMONADA DE COCO", cantidad: 1, precio_unit: 18000, total: 18000 },
      { nombre: "TRAGO DOBLE", cantidad: 1, precio_unit: 15000, total: 15000, nota: "PVP derivado" },
      { nombre: "LIMONADA CEREZADA", cantidad: 1, precio_unit: 12000, total: 12000, nota: "PVP derivado" },
      { nombre: "JUGO EN AGUA", cantidad: 3, precio_unit: 3000, total: 9000, nota: "PVP derivado" },
      { nombre: "LIMONADA NATURAL", cantidad: 1, precio_unit: 4000, total: 4000 },
    ],
    nota: "Sábado 13 jun SIN promo - DÍA GRANDE. Cócteles $1.008.000 (¡K Mojito x9, K Margarita x5!). Estanco solo $55k (este sábado el POS clasificó casi todo - cervezas grandes, ron, vino, tragos - como cócteles). Estanco cuadra EXACTO con 3 nacional + 1 importada + chiscake + aromática. Cócteles cuadran EXACTO pero OJO: MUCHOS ítems especiales valorados por RESIDUAL (jarra sangría, caja de vino, ron caldas botella/media, limonada de vino, reserva, tragos dobles) - el detalle por ítem es APROXIMADO; la cifra válida es el total del cuadre. Por confirmar con carta. REPOSICIÓN entró: Corona +12, Gaseosa +24, Vino Botella +3, Caja de Vino +2, Whisky Coctelería +1, Dry Martini +1 (factura/pago pendiente)."
  },
  {
    date: "2026-06-14", total_estanco: 626000, total_cocteles: 1444000, total: 2070000, total_units: 130,
    estanco: [
      { nombre: "MICHELADA", cantidad: 20, precio_unit: 12000, total: 240000, nota: "Usan 20 cerveza nacional" },
      { nombre: "CERVEZA NACIONAL", cantidad: 15, precio_unit: 9000, total: 135000, nota: "15 directas; +20 en micheladas; baja total inventario 35" },
      { nombre: "CERVEZA CORONA", cantidad: 8, precio_unit: 12000, total: 96000 },
      { nombre: "AGTE BOTELLA CAUCANO", cantidad: 1, precio_unit: 60000, total: 60000, nota: "Botella - PVP derivado por residual, por confirmar" },
      { nombre: "CERVEZA IMPORTADA", cantidad: 3, precio_unit: 13000, total: 39000 },
      { nombre: "AGTE MEDIA ANTIOQUEÑO", cantidad: 1, precio_unit: 29000, total: 29000 },
      { nombre: "AGUA TONICA", cantidad: 3, precio_unit: 5000, total: 15000 },
      { nombre: "AGUA", cantidad: 2, precio_unit: 6000, total: 12000 },
      { nombre: "GASEOSA", cantidad: 22, precio_unit: 0, total: 0, nota: "Mezclador" },
    ],
    cocteles: [
      { nombre: "K FROZEN GRANIZADO", cantidad: 9, precio_unit: 36000, total: 324000, nota: "PVP base $36k (con 9 unidades el premium $48k no encaja - por confirmar)" },
      { nombre: "K TOM COLLINS", cantidad: 4, precio_unit: 36000, total: 144000 },
      { nombre: "K GIN TONIC", cantidad: 3, precio_unit: 36000, total: 108000 },
      { nombre: "K LONG INSLAND", cantidad: 3, precio_unit: 36000, total: 108000, nota: "PVP por confirmar" },
      { nombre: "K MOJITO", cantidad: 3, precio_unit: 36000, total: 108000 },
      { nombre: "K PINA COLADA CON LICOR", cantidad: 3, precio_unit: 36000, total: 108000, nota: "PVP por confirmar" },
      { nombre: "K MARGARITA MIX", cantidad: 2, precio_unit: 38000, total: 76000 },
      { nombre: "K DAIQUIRI DE FRESAS", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K ACAPULCO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K ALEXANDER", cantidad: 1, precio_unit: 36000, total: 36000, nota: "PVP por confirmar" },
      { nombre: "K CAIPIRINHA", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K DEMONIO VERDE", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K DESTORNILLADOR", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MOJITO MIX", cantidad: 1, precio_unit: 38000, total: 38000 },
      { nombre: "K TEQUILA SUNRISE", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K ULA ULA", cantidad: 1, precio_unit: 36000, total: 36000, nota: "PVP por confirmar" },
      { nombre: "VARIOS ESPECIALES (Tequila botella, Jarra sangría, Caja vino, Ron DL x2, Red Bull x2, Soda, Jugo en agua x4, Limonadas, Tequila ML)", cantidad: 17, precio_unit: 0, total: 106000, nota: "RESIDUAL - PVP por confirmar con carta. Incluye 1 tequila botella (baja inventario confirmada) cuyo PVP no se pudo aislar este día récord" },
    ],
    nota: "Domingo 14 jun SIN promo - DÍA RÉCORD del bar ($2.070.000). 38 cócteles K + 20 micheladas + 35 nacionales. Totales del cuadre EXACTOS y autoritativos. Detalle por ítem APROXIMADO: con tantas referencias, varios PVP especiales (granizado x9, tequila botella, sangría, caja vino) y el cruce michelada-cerveza no permiten conciliación exacta por ítem sin la carta. Bajas validadas. OJO: AGUA TONICA quedó en saldo NEGATIVO (-2): se vendieron 3 con inicial 1 → falta una entrada sin registrar o recuento. Sin reposición."
  },
  {
    date: "2026-06-15", total_estanco: 42000, total_cocteles: 549000, total: 591000, total_units: 25,
    estanco: [
      { nombre: "COPA DE VINO", cantidad: 2, precio_unit: 13000, total: 26000 },
      { nombre: "RED BULL", cantidad: 1, precio_unit: 13000, total: 13000 },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 3000, total: 3000 },
      { nombre: "GASEOSA", cantidad: 10, precio_unit: 0, total: 0, nota: "Mezclador" },
    ],
    cocteles: [
      { nombre: "K MARGARITA", cantidad: 6, precio_unit: 38000, total: 228000 },
      { nombre: "K PECERA LA SALA", cantidad: 2, precio_unit: 95000, total: 190000 },
      { nombre: "K MOJITO", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K MEDUSA", cantidad: 1, precio_unit: 59000, total: 59000, nota: "PVP $59k DERIVADO por residual para cuadre exacto (alternativa: Medusa estándar $36k + venta de vino ~$23k). Por confirmar con carta." },
      { nombre: "TEQUILA BOTELLA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería (baja), no venta directa" },
      { nombre: "TRIPLE SEC", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería (margaritas)" },
      { nombre: "VINO BOTELLA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo (copas de vino)" },
      { nombre: "VODKA DL", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería (medusa)" },
      { nombre: "WHISKY COCT", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "RON DL", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería (mojitos)" },
    ],
    nota: "Lunes 15 jun SIN promo. Estanco $42k cuadra EXACTO (2 copas vino + red bull + ginebra ML). Cócteles $549k cuadran EXACTO (6 margaritas, 2 peceras a $95k, 2 mojitos, 1 medusa). K MEDUSA valorada a $59k por residual - por confirmar. Los licores (tequila botella, triple sec, vino, vodka, whisky, ron) son INSUMOS de coctelería (baja), no ventas directas. SIN FOTO DE INVENTARIO este día: el inventario final del 15 queda PENDIENTE (se reconstruye con la foto inicial del 16)."
  },
  {
    date: "2026-06-16", total_estanco: 160000, total_cocteles: 278000, total: 438000, total_units: 29,
    estanco: [
      { nombre: "AGTE BOTELLA ANTIOQUEÑO", cantidad: 1, precio_unit: 79000, total: 79000, nota: "Botella - PVP derivado por residual para cuadrar estanco exacto, por confirmar con carta" },
      { nombre: "CERVEZA CORONA", cantidad: 4, precio_unit: 12000, total: 48000 },
      { nombre: "CERVEZA NACIONAL", cantidad: 2, precio_unit: 9000, total: 18000 },
      { nombre: "VODKA DL", cantidad: 1, precio_unit: 12000, total: 12000, nota: "PVP residual por confirmar" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 3000, total: 3000 },
      { nombre: "GASEOSA", cantidad: 2, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "GASEOSA 1.5", cantidad: 2, precio_unit: 0, total: 0, nota: "Mezclador" },
    ],
    cocteles: [
      { nombre: "K MARGARITA MIX", cantidad: 8, precio_unit: 38000, total: 152000, nota: "2x1 martes: 4 cobradas de 8" },
      { nombre: "K COCO LOCO", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1 martes: 1 de 2" },
      { nombre: "K MARTINI CHOCOLATE", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1 martes: 1 de 2" },
      { nombre: "SODA ITALIANA", cantidad: 2, precio_unit: 15000, total: 30000 },
      { nombre: "LIMONADA CEREZADA", cantidad: 1, precio_unit: 12000, total: 12000, nota: "PVP por confirmar con carta" },
      { nombre: "LIMONADA NATURAL", cantidad: 1, precio_unit: 12000, total: 12000, nota: "PVP por confirmar con carta" },
    ],
    nota: "Martes 16 jun CON promo 2x1 en cócteles K. Cócteles $278k cuadran EXACTO: K-cócteles 2x1 ($224k = Margarita Mix 4/8 + Coco Loco 1/2 + Martini Chocolate 1/2) + soda/limonadas a precio lleno ($54k, limonadas por confirmar). Estanco $160k cuadra exacto con AGTE Antioqueño botella derivada a $79k (residual, por confirmar) + 4 corona + 2 nacional + vodka DL + tequila ML; gaseosas como mezclador $0. REPOSICIÓN entró (sin factura cargada aún): Cerveza Importada +2, Ginebra ML +3, Licor Manzana +4, Ron DL +5, Tequila ML +6, Triple Sec +1. Bajas validadas contra inventario. AGUA TÓNICA sigue en -2 (sobreventa del 14, pendiente)."
  },
  {
    date: "2026-06-17", total_estanco: 696000, total_cocteles: 520000, total: 1216000, total_units: 102,
    estanco: [
      { nombre: "AGTE BOTELLA ANTIOQUEÑO", cantidad: 1, precio_unit: 79000, total: 79000, nota: "Botella - PVP residual, por confirmar" },
      { nombre: "AGTE BOTELLA CAUCANO", cantidad: 3, precio_unit: 55000, total: 165000, nota: "Botella - PVP residual, por confirmar" },
      { nombre: "CERVEZA NACIONAL", cantidad: 23, precio_unit: 9000, total: 207000 },
      { nombre: "CERVEZA CORONA", cantidad: 9, precio_unit: 12000, total: 108000 },
      { nombre: "CERVEZA IMPORTADA", cantidad: 2, precio_unit: 12000, total: 24000 },
      { nombre: "MICHELADA", cantidad: 5, precio_unit: 12000, total: 60000 },
      { nombre: "GINEBRA DL", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 3000, total: 3000 },
      { nombre: "GASEOSA", cantidad: 1, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "GASEOSA 1.5", cantidad: 1, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "AJUSTE noche alto volumen", cantidad: 0, precio_unit: 0, total: 38000, nota: "Residual para cuadrar estanco POS $696k. Incluye aromática de fruta (~15 und) y desfase por FALTANTE DE CERVEZAS $40.300 (registrado como gasto). Detalle item-level aprox - noche récord." },
    ],
    cocteles: [
      { nombre: "K DEMONIO VERDE", cantidad: 6, precio_unit: 36000, total: 108000, nota: "2x1 miércoles: 3 cobradas de 6" },
      { nombre: "K FROZEN GRANIZADO", cantidad: 1, precio_unit: 48000, total: 48000, nota: "Granizado - PVP por confirmar" },
      { nombre: "K ORGASMO MULTIPLE", cantidad: 1, precio_unit: 36000, total: 36000, nota: "2x1: 1 de 1 (impar, cobra 1)" },
      { nombre: "K ULA ULA", cantidad: 1, precio_unit: 36000, total: 36000, nota: "2x1: 1 de 1" },
      { nombre: "LIMONADA NATURAL", cantidad: 16, precio_unit: 4000, total: 64000, nota: "PVP por confirmar" },
      { nombre: "LIMONADA DE VINO", cantidad: 2, precio_unit: 18000, total: 36000 },
      { nombre: "Otros preparados (bundle)", cantidad: 0, precio_unit: 0, total: 192000, nota: "Residual para cuadrar cócteles POS $520k. Agrupa: limonada cerezada/coco/hierbabuena, soda italiana, aromática de fruta y 'BUNKER' (~9 und). PVP por confirmar con carta - detalle aprox noche récord." },
    ],
    nota: "MIÉRCOLES 17 JUN - NOCHE RÉCORD DE JUNIO ($2.883.000 venta). CON promo 2x1 en cócteles K. Estanco $696k y cócteles $520k = TOTALES POS AUTORITATIVOS. Item-level APROXIMADO (noche de altísimo volumen + FALTANTE DE CERVEZAS $40.300): se respeta la regla 'totales mandan, ítem aprox, nunca force-fit'. Bajas de cerveza no cuadran exacto vs venta de bar por el faltante. REPOSICIONES grandes entraron (ver inventario): Caucano +6, Tónica +12, Red Bull +8, Corona +24, Stella/Importada +24, Nacional +120 (Club/Poker/Light), Canasta soda +30. AGUA TÓNICA -2 RESUELTA: +12 tónicas la dejan en +10."
  },
  {
    date: "2026-06-18", total_estanco: 99000, total_cocteles: 338000, total: 437000, total_units: 51,
    estanco: [
      { nombre: "AGUA", cantidad: 9, precio_unit: 6000, total: 54000 },
      { nombre: "CREMA DE WHISKY", cantidad: 1, precio_unit: 13000, total: 13000, nota: "Trago crema whisky" },
      { nombre: "AGUA TONICA", cantidad: 1, precio_unit: 5000, total: 5000 },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 3000, total: 3000 },
      { nombre: "GASEOSA", cantidad: 8, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "CERVEZA CORONA", cantidad: 16, precio_unit: 0, total: 0, nota: "FLAG: salió de inventario pero estanco POS no la cobró a tarifa - ver ajuste cortesía" },
      { nombre: "CERVEZA IMPORTADA", cantidad: 8, precio_unit: 0, total: 0, nota: "FLAG: ver ajuste cortesía" },
      { nombre: "CERVEZA NACIONAL", cantidad: 7, precio_unit: 0, total: 0, nota: "FLAG: ver ajuste cortesía" },
      { nombre: "AJUSTE cervezas cobradas/cortesía", cantidad: 0, precio_unit: 0, total: 24000, nota: "Residual para cuadrar estanco POS $99k. OJO: salieron 31 cervezas de inventario (16 corona + 8 importada + 7 nacional) pero el estanco total es solo $99k. La mayoría parece CONSUMO/CORTESÍA/EVENTO (nómina alta $185k este día). VERIFICAR con Juanma." },
    ],
    cocteles: [
      { nombre: "K MOJITO", cantidad: 3, precio_unit: 36000, total: 108000 },
      { nombre: "K OLD FASHION", cantidad: 3, precio_unit: 36000, total: 108000 },
      { nombre: "K MARGARITA MIX", cantidad: 1, precio_unit: 38000, total: 38000 },
      { nombre: "K GIN TONIC", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "LIMONADA DE VINO", cantidad: 1, precio_unit: 18000, total: 18000 },
      { nombre: "LIMONADA CEREZADA", cantidad: 1, precio_unit: 15000, total: 15000, nota: "PVP por confirmar" },
      { nombre: "SODA ITALIANA", cantidad: 1, precio_unit: 15000, total: 15000 },
    ],
    nota: "Jueves 18 jun SIN promo 2x1 (solo martes/miércoles). Cócteles $338k cuadran EXACTO con K a precio lleno (Mojito 3, Old Fashion 3, Margarita Mix 1, Gin Tonic 1 = $290k) + limonadas/soda ($48k). Estanco $99k: agua/tónica/crema whisky/tequila ML cobrados; GASEOSA mezclador $0. FLAG IMPORTANTE: salieron 31 cervezas de inventario (16+8+7) pero el estanco fue solo $99k -> consumo/cortesía/evento, verificar. Sin reposiciones hoy. Bajas de licor de cócteles van por mL (no decrementan unidades enteras)."
  },
  {
    date: "2026-06-19", total_estanco: 165000, total_cocteles: 671000, total: 836000, total_units: 53,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 12, precio_unit: 9000, total: 108000 },
      { nombre: "CERVEZA CORONA", cantidad: 2, precio_unit: 12000, total: 24000 },
      { nombre: "AGUA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 3000, total: 3000 },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 3000, total: 3000 },
      { nombre: "GASEOSA", cantidad: 17, precio_unit: 0, total: 0, nota: "Mezclador (17 und para cócteles/sodas)" },
      { nombre: "AJUSTE estanco", cantidad: 0, precio_unit: 0, total: 21000, nota: "Residual para cuadrar estanco POS $165k (precios cerveza/gaseosa aprox)" },
    ],
    cocteles: [
      { nombre: "K PECERA LA SALA", cantidad: 2, precio_unit: 95000, total: 190000 },
      { nombre: "K MARGARITA", cantidad: 2, precio_unit: 38000, total: 76000 },
      { nombre: "K MOJITO", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K ACAPULCO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K BLUE HAWAI", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K COCO LOCO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MOJITO MIX", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K PINA COLADA CON LIC", cantidad: 1, precio_unit: 47000, total: 47000, nota: "Con licor - PVP premium derivado por residual" },
      { nombre: "RESERVA", cantidad: 1, precio_unit: 40000, total: 40000, nota: "PVP derivado, por confirmar" },
      { nombre: "SODA ITALIANA", cantidad: 5, precio_unit: 15000, total: 75000 },
      { nombre: "LIMONADA CEREZADA", cantidad: 1, precio_unit: 15000, total: 15000 },
      { nombre: "LIMONADA DE COCO", cantidad: 1, precio_unit: 12000, total: 12000 },
    ],
    nota: "Viernes 19 jun SIN promo 2x1. Cócteles $671k a precio lleno: 2 Peceras ($190k) + K varios + Reserva + 5 sodas. Estanco $165k (12 nacional + 2 corona + agua + ginebra/tequila ML; gaseosa mezclador). OTROS $35.000 = 1 CHICSCAKE $15.000 + $20.000 SIN CLASIFICAR (FLAG: la tirilla del cuadre suma componentes 1.540.400 pero imprime Total 1.560.400; el lado del dinero -pagos- confirma 1.560.400, así que los $20.000 quedan en otros_venta como diferencia POS no categorizada, por verificar). Continuidad perfecta, sin reposiciones. Piña Colada con Lic y Reserva con PVP derivado."
  },
  {
    date: "2026-06-20", total_estanco: 164000, total_cocteles: 424000, total: 588000, total_units: 53,
    estanco: [
      { nombre: "CERVEZA CORONA", cantidad: 7, precio_unit: 12000, total: 84000, nota: "Bar marca 7; inventario baja 6 (1 dif menor)" },
      { nombre: "CERVEZA NACIONAL", cantidad: 3, precio_unit: 9000, total: 27000 },
      { nombre: "MICHELADA", cantidad: 2, precio_unit: 12000, total: 24000 },
      { nombre: "ELECTROLIT", cantidad: 2, precio_unit: 8000, total: 16000 },
      { nombre: "JUGO EN AGUA", cantidad: 1, precio_unit: 7000, total: 7000, nota: "PVP por confirmar" },
      { nombre: "AGUA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "GASEOSA", cantidad: 16, precio_unit: 0, total: 0, nota: "Mezclador" },
    ],
    cocteles: [
      { nombre: "K FROZEN GRANIZADO", cantidad: 2, precio_unit: 48000, total: 96000, nota: "Granizado - PVP por confirmar" },
      { nombre: "K MOJITO", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K MARGARITA", cantidad: 1, precio_unit: 38000, total: 38000 },
      { nombre: "K OLD FASHION", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K PINA COLADA CON LIC", cantidad: 1, precio_unit: 47000, total: 47000, nota: "Con licor - PVP premium derivado" },
      { nombre: "RESERVA", cantidad: 1, precio_unit: 45000, total: 45000, nota: "PVP derivado por residual, por confirmar" },
      { nombre: "SODA ITALIANA", cantidad: 2, precio_unit: 15000, total: 30000 },
      { nombre: "LIMONADA DE COCO", cantidad: 2, precio_unit: 12000, total: 24000 },
      { nombre: "LIMONADA NATURAL", cantidad: 9, precio_unit: 4000, total: 36000 },
    ],
    nota: "Sábado 20 jun SIN promo 2x1. Cócteles $424k a precio lleno (2 granizados, K varios, Reserva, soda, 9 limonadas naturales). Estanco $164k (7 corona + 3 nacional + 2 michelada + electrolit + jugo + agua; gaseosa mezclador). Reposiciones chicas: Cerveza Importada +1, Tequila ML +1. Continuidad perfecta. Día con FIESTA/EVENTO: gastos de globos+decoración $60k y publicidad Búnker = 4 granizados cortesía $100k. NETO DÍA NEGATIVO por gastos no recurrentes (Bold tarjetas $400k + publicidad $100k)."
  },
  {
    date: "2026-06-22", total_estanco: 324000, total_cocteles: 217000, total: 541000, total_units: 55,
    estanco: [
      { nombre: "WHISKY OLD PAR BOTELLA", cantidad: 1, precio_unit: 62000, total: 62000, nota: "FLAG: salió 1 botella Old Parr de inventario, pero a precio de carta vale ~$180k+. El estanco POS $324k no alcanza para botella a tarifa -> posible cortesía/precio especial/servicio. PVP derivado por residual, VERIFICAR." },
      { nombre: "AGTE BOTELLA ANTIOQUEÑO", cantidad: 1, precio_unit: 79000, total: 79000, nota: "Botella - PVP residual" },
      { nombre: "MICHELADA", cantidad: 6, precio_unit: 12000, total: 72000 },
      { nombre: "CERVEZA NACIONAL", cantidad: 7, precio_unit: 9000, total: 63000 },
      { nombre: "CERVEZA CORONA", cantidad: 2, precio_unit: 12000, total: 24000 },
      { nombre: "CERVEZA IMPORTADA", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AGUA", cantidad: 2, precio_unit: 6000, total: 12000 },
      { nombre: "GASEOSA", cantidad: 21, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "GASEOSA 1.5", cantidad: 1, precio_unit: 0, total: 0, nota: "Mezclador" },
    ],
    cocteles: [
      { nombre: "SODA ITALIANA", cantidad: 8, precio_unit: 15000, total: 120000 },
      { nombre: "K MOJITO MIX", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "LICOR DE MANZANA", cantidad: 2, precio_unit: 10500, total: 21000, nota: "Shots licor manzana - PVP por confirmar" },
      { nombre: "LIMONADA NATURAL", cantidad: 1, precio_unit: 4000, total: 4000 },
    ],
    nota: "Lunes 22 jun SIN promo 2x1. Estanco $324k y cócteles $217k = TOTALES POS. FLAG estanco: salieron botella Old Parr + botella Antioqueño de inventario, pero $324k no cubre Old Parr a tarifa (~$180k) + Antioqueño + 10 cervezas + 6 micheladas -> hay cortesía/precio especial, item-level aprox. REPOSICIONES GRANDES (compras de contado): Licores Junior F1JC70279 $1.890.500 (Caucano +5, Real +8, Agua +24, Gaseosa +108, Ron Caldas Bot/Med +2/+2, Tequila Bot +2, Dry Martini +1) y Cervezas y Cervezas $512.800 (Corona +48, Importada +36, Nacional +24). DOMINGO 21: sin cuadre (La Sala no operó); inicial-22 trae desfase menor vs cierre sábado (Corona -1, Gaseosa -2) = consumo/merma fin de semana."
  },
  {
    date: "2026-06-23", total_estanco: 968000, total_cocteles: 506000, total: 1474000, total_units: 167,
    estanco: [
      { nombre: "AGTE BOTELLA ANTIOQUEÑO", cantidad: 4, precio_unit: 79000, total: 316000, nota: "4 botellas a precio lleno (botella no entra en 2x1) - PVP residual" },
      { nombre: "CERVEZA CORONA", cantidad: 43, precio_unit: 12000, total: 264000, nota: "2x1 martes: se cobran 22 de 43" },
      { nombre: "CERVEZA NACIONAL", cantidad: 53, precio_unit: 9000, total: 243000, nota: "2x1 martes: se cobran 27 de 53" },
      { nombre: "MICHELADA", cantidad: 12, precio_unit: 12000, total: 72000, nota: "2x1 martes: se cobran 6 de 12" },
      { nombre: "CERVEZA IMPORTADA", cantidad: 6, precio_unit: 12000, total: 36000, nota: "2x1 martes: se cobran 3 de 6" },
      { nombre: "AGUA", cantidad: 4, precio_unit: 6000, total: 24000 },
      { nombre: "GASEOSA", cantidad: 15, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "GASEOSA 1.5", cantidad: 3, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "AJUSTE estanco (curazao, ron DL, red bull sueltos)", cantidad: 0, precio_unit: 0, total: 13000, nota: "Residual para cuadrar estanco POS $968k" },
    ],
    cocteles: [
      { nombre: "SODA ITALIANA", cantidad: 7, precio_unit: 15000, total: 105000 },
      { nombre: "RESERVA", cantidad: 1, precio_unit: 45000, total: 45000, nota: "PVP derivado, por confirmar" },
      { nombre: "TRAGO DOBLE", cantidad: 1, precio_unit: 40000, total: 40000, nota: "PVP por confirmar" },
      { nombre: "JUGO MIX", cantidad: 3, precio_unit: 13000, total: 39000 },
      { nombre: "K BLUE HAWAI", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1 martes: 1 de 2" },
      { nombre: "K CUBA LIBRE", cantidad: 1, precio_unit: 36000, total: 36000, nota: "2x1: 1 de 1" },
      { nombre: "K PINA COLADA SIN LIC", cantidad: 1, precio_unit: 36000, total: 36000, nota: "2x1: 1 de 1" },
      { nombre: "LIMONADA DE HIERBABUENA", cantidad: 3, precio_unit: 12000, total: 36000 },
      { nombre: "LIMONADA DE COCO", cantidad: 2, precio_unit: 12000, total: 24000 },
      { nombre: "AROMATICA DE FRUTA", cantidad: 2, precio_unit: 10000, total: 20000, nota: "PVP por confirmar" },
      { nombre: "LIMONADA CEREZADA", cantidad: 1, precio_unit: 15000, total: 15000 },
      { nombre: "JUGO EN LECHE", cantidad: 1, precio_unit: 13000, total: 13000, nota: "PVP por confirmar" },
      { nombre: "LIMONADA NATURAL", cantidad: 2, precio_unit: 4000, total: 8000 },
      { nombre: "AJUSTE cócteles", cantidad: 0, precio_unit: 0, total: 53000, nota: "Residual para cuadrar cócteles POS $506k (PVP de jugos/aromática/trago por confirmar)" },
    ],
    nota: "MARTES 23 JUN - DÍA GRANDE 2x1 ($2.526.600 venta). FLAG: el estanco $968k solo cuadra si el 2x1 aplicó también a CERVEZA y MICHELADA (102 cervezas + 4 botellas a precio lleno darían ~$1,5M). Apliqué 2x1 a cerveza+michelada (cobra mitad) + antioqueño botellas a precio lleno -> VERIFICAR si el martes el 2x1 incluye cerveza, o si hubo cortesía/evento. Tirilla de bar venía rotulada 'Martes 18' pero es del 23 (volumen e inventario lo confirman). REPOSICIONES: Antioqueño +6 botella/+2 media (Licovanaca $272.405), Nacional +108 + Caucano +3 botella/+3 media (Cervezas y Cervezas POE 55231). Item-level aprox - totales POS mandan."
  },
  {
    date: "2026-06-24", total_estanco: 34000, total_cocteles: 239000, total: 273000, total_units: 20,
    estanco: [
      { nombre: "CERVEZA IMPORTADA", cantidad: 4, precio_unit: 12000, total: 24000, nota: "2x1 miércoles: se cobran 2 de 4" },
      { nombre: "CERVEZA NACIONAL", cantidad: 1, precio_unit: 9000, total: 9000 },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 1000, total: 1000, nota: "Residual" },
      { nombre: "GASEOSA", cantidad: 2, precio_unit: 0, total: 0, nota: "Mezclador" },
    ],
    cocteles: [
      { nombre: "RESERVA", cantidad: 1, precio_unit: 45000, total: 45000, nota: "PVP derivado" },
      { nombre: "K MARGARITA MIX", cantidad: 1, precio_unit: 38000, total: 38000 },
      { nombre: "K ACAPULCO", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1 miércoles: 1 de 2" },
      { nombre: "K COCO LOCO", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1 miércoles: 1 de 2" },
      { nombre: "K GIN TONIC", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1 miércoles: 1 de 2" },
      { nombre: "RON CALDAS BOTELLA (3 tragos)", cantidad: 3, precio_unit: 11000, total: 33000, nota: "3 tragos de 1 botella abierta - PVP por confirmar" },
      { nombre: "SODA ITALIANA", cantidad: 1, precio_unit: 15000, total: 15000 },
    ],
    nota: "MIÉRCOLES 24 JUN - día chico ($461.400), 2x1 en K-cócteles. Estanco $34k mínimo. Tarjeta $0 (todo efectivo + nómina + gastos). Bajas inventario: Importada -4, Nacional -1, Gaseosa -3, Tequila ML -1, Ron Caldas Bot -1 (abierta para tragos). Item-level aprox - totales POS mandan."
  },
  {
    date: "2026-06-25", total_estanco: 90000, total_cocteles: 196000, total: 286000, total_units: 19,
    estanco: [
      { nombre: "AGTE MEDIA CAUCANO", cantidad: 1, precio_unit: 45000, total: 45000, nota: "Media botella - PVP derivado" },
      { nombre: "CERVEZA NACIONAL", cantidad: 2, precio_unit: 9000, total: 18000 },
      { nombre: "CERVEZA IMPORTADA", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AGUA TONICA", cantidad: 2, precio_unit: 6000, total: 12000 },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 3000, total: 3000 },
      { nombre: "GASEOSA", cantidad: 4, precio_unit: 0, total: 0, nota: "Mezclador" },
    ],
    cocteles: [
      { nombre: "K MARGARITA", cantidad: 3, precio_unit: 36000, total: 108000 },
      { nombre: "K MARGARITA MIX", cantidad: 1, precio_unit: 38000, total: 38000 },
      { nombre: "K MOJITO MIX", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "JUGO EN LECHE", cantidad: 1, precio_unit: 13000, total: 13000 },
      { nombre: "LICOR DE MANZANA", cantidad: 1, precio_unit: 1000, total: 1000, nota: "Shot residual" },
      { nombre: "TRIPLE SEC", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería (margaritas)" },
    ],
    nota: "JUEVES 25 JUN - día chico ($379.600), SIN 2x1 (jueves no aplica). Neto positivo $299.720 (sin nómina, gastos $5k). Bajas: Media Caucano -1, Agua Tónica -2, Importada -1, Nacional -2, Gaseosa -4, Licor Manzana -1, Tequila ML -1, Triple Sec -1. FLAG: entrada +30 GASEOSA sin factura/transferencia aportada (reposición menor por confirmar). Estanco y cócteles cuadran al peso."
  },
  {
    date: "2026-06-26", total_estanco: 245000, total_cocteles: 365000, total: 610000, total_units: 66,
    estanco: [
      { nombre: "MICHELADA", cantidad: 9, precio_unit: 12000, total: 108000, nota: "Base cerveza nacional (9 de las 20 nacionales que salieron)" },
      { nombre: "CERVEZA NACIONAL", cantidad: 11, precio_unit: 9000, total: 99000, nota: "20 nacionales salieron: 11 cerveza + 9 para michelada" },
      { nombre: "CERVEZA IMPORTADA", cantidad: 3, precio_unit: 12000, total: 36000 },
      { nombre: "GASEOSA", cantidad: 22, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "GASEOSA 1.5", cantidad: 1, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "AJUSTE estanco (corona 1, media caucano 1, agua tónica 1, tequila ML 1)", cantidad: 4, precio_unit: 0, total: 2000, nota: "Salieron de inventario pero mayormente cortesía/personal viernes - residual para cuadrar estanco POS $245k" },
    ],
    cocteles: [
      { nombre: "K MEDUSA", cantidad: 1, precio_unit: 75000, total: 75000, nota: "Cóctel premium/pecera - PVP derivado, por confirmar" },
      { nombre: "K CUBA LIBRE", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K GIN TONIC", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MARGARITA", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MOJITO MIX", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K PINA COLADA SIN LIC", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MARGARITA MIX", cantidad: 1, precio_unit: 38000, total: 38000 },
      { nombre: "LIMONADA CEREZADA", cantidad: 2, precio_unit: 15000, total: 30000 },
      { nombre: "LIMONADA NATURAL", cantidad: 4, precio_unit: 4000, total: 16000 },
      { nombre: "SODA ITALIANA", cantidad: 1, precio_unit: 15000, total: 15000 },
      { nombre: "LICOR DE MANZANA", cantidad: 1, precio_unit: 10500, total: 10500, nota: "Shot" },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 500, total: 500, nota: "Residual / insumo" },
    ],
    nota: "VIERNES 26 JUN - día fuerte ($950.200), SIN 2x1. Nómina alta $445k (viernes). Bajas: Media Caucano -1, Agua Tónica -1, Corona -1, Importada -3, Nacional -20 (11 cerveza + 9 michelada), Gaseosa -22, Gaseosa 1.5 -1, Ginebra ML -1, Licor Manzana -1, Tequila ML -1. Cocina con pizza EMPLEADO a $0 (cortesía). K Medusa con PVP premium por confirmar. Item-level aprox - totales POS mandan."
  },
  {
    date: "2026-06-27", total_estanco: 1268000, total_cocteles: 682000, total: 1950000, total_units: 199,
    estanco: [
      { nombre: "AGTE BOTELLA ANTIOQUEÑO", cantidad: 6, precio_unit: 79000, total: 474000, nota: "6 botellas (servicio mesa) - PVP residual" },
      { nombre: "TEQUILA BOTELLA", cantidad: 2, precio_unit: 90000, total: 180000, nota: "PVP derivado, por confirmar" },
      { nombre: "AGTE MEDIA ANTIOQUEÑO", cantidad: 4, precio_unit: 42000, total: 168000 },
      { nombre: "AGTE BOTELLA CAUCANO", cantidad: 3, precio_unit: 55000, total: 165000 },
      { nombre: "AGTE MEDIA CAUCANO", cantidad: 1, precio_unit: 30000, total: 30000 },
      { nombre: "CERVEZAS + MICHELADAS evento (63 Nacional + 18 Corona + 3 Importada + 10 Michelada + 2 Agua)", cantidad: 96, precio_unit: 0, total: 251000, nota: "FLAG: 96 unidades de cerveza/michelada a tarifa darían ~$950k, pero el estanco POS solo deja $251k tras las botellas. Implica cortesía/cubierto fuerte en noche de servicio de botella. Item-level MUY aprox - total POS manda." },
      { nombre: "GASEOSA", cantidad: 43, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "GASEOSA 1.5", cantidad: 1, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "TEQUILA ML", cantidad: 2, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
    ],
    cocteles: [
      { nombre: "TRAGO DOBLE", cantidad: 4, precio_unit: 40000, total: 160000 },
      { nombre: "K BURBUJAS AZULES", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K FROZEN GRANIZADO", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "RESERVA", cantidad: 1, precio_unit: 45000, total: 45000 },
      { nombre: "K CAIPIRINHA", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MEXICO LINDO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MOJITO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K TEQUILA SUNRISE", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K WHITE SKY", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "LIMONADA CEREZADA", cantidad: 2, precio_unit: 15000, total: 30000 },
      { nombre: "LICOR DE MANZANA", cantidad: 5, precio_unit: 6000, total: 30000, nota: "Shots" },
      { nombre: "LIMONADA DE HIERBABUENA", cantidad: 2, precio_unit: 12000, total: 24000 },
      { nombre: "JUGO EN AGUA", cantidad: 2, precio_unit: 8000, total: 16000 },
      { nombre: "SODA ITALIANA", cantidad: 1, precio_unit: 15000, total: 15000 },
      { nombre: "RON CALDAS MEDIA (8 tragos)", cantidad: 8, precio_unit: 1500, total: 12000, nota: "Tragos de botella abierta - residual" },
      { nombre: "LIMONADA DE COCO", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AROMATICA DE FRUTA", cantidad: 1, precio_unit: 10000, total: 10000 },
      { nombre: "LIMONADA NATURAL", cantidad: 1, precio_unit: 4000, total: 4000 },
    ],
    nota: "SÁBADO 27 JUN - NOCHE GRANDE ($2.616.000 venta, neto $1.743.200). Servicio de botella fuerte: 6 botellas Antioqueño + 3 Caucano + 4 medias Antioqueño + 2 botellas Tequila. FLAG ESTANCO: 96 cervezas/micheladas no caben a tarifa en el estanco $1.268k tras las botellas -> cortesía/cubierto fuerte (igual patrón que otras noches grandes, ver 2x1 martes). REPOSICIONES sin factura aportada: Corona +48, Nacional +60, Gaseosa +48, Ginebra ML +2, Licor Manzana +5. Item-level aprox - totales POS mandan."
  },
  {
    date: "2026-06-28", total_estanco: 39000, total_cocteles: 207000, total: 246000, total_units: 16,
    estanco: [
      { nombre: "GASEOSA", cantidad: 10, precio_unit: 3000, total: 30000, nota: "Vendidas como bebida (domingo lento), no mezclador" },
      { nombre: "TRIPLE SEC", cantidad: 1, precio_unit: 9000, total: 9000, nota: "Shot" },
    ],
    cocteles: [
      { nombre: "K PECERA LA SALA", cantidad: 1, precio_unit: 95000, total: 95000, nota: "Pecera - PVP carta" },
      { nombre: "K COSMOPOLITAN", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K DEMONIO VERDE", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K FROZEN GRANIZADO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "SODA ITALIANA", cantidad: 1, precio_unit: 15000, total: 15000 },
      { nombre: "AJUSTE cócteles", cantidad: 0, precio_unit: 0, total: -11000, nota: "Residual para cuadrar cócteles POS $207k (PVP de pecera/granizado por confirmar)" },
    ],
    nota: "DOMINGO 28 JUN - día chico ($418.600), SIN 2x1. ESTE domingo SÍ operaron (a diferencia del domingo 21 que cerraron). Neto +$209.320. Bajas: Gaseosa -10, Triple Sec -1, Tequila ML -1 (cóctel). Item-level aprox - totales POS mandan."
  },
  {
    date: "2026-06-29", total_estanco: 90000, total_cocteles: 13000, total: 103000, total_units: 14,
    estanco: [
      { nombre: "GASEOSA", cantidad: 9, precio_unit: 5000, total: 45000, nota: "Vendidas como bebida (lunes lento), no mezclador" },
      { nombre: "CERVEZA IMPORTADA", cantidad: 3, precio_unit: 12000, total: 36000 },
      { nombre: "CERVEZA NACIONAL", cantidad: 1, precio_unit: 9000, total: 9000 },
    ],
    cocteles: [
      { nombre: "JUGO MIX", cantidad: 1, precio_unit: 13000, total: 13000 },
    ],
    nota: "LUNES 29 JUN - día chico ($371.000), SIN 2x1. Neto NEGATIVO -$114.400 por nómina $185k + gastos $86k (hielo + decoración) sobre venta baja. Bajas: Importada -3, Nacional -1, Gaseosa -9. Estanco y cócteles cuadran al peso."
  },
  {
    date: "2026-06-30", total_estanco: 99000, total_cocteles: 56000, total: 155000, total_units: 25,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 17, precio_unit: 9000, total: 72000, nota: "2x1 martes: se cobran 8 de 17" },
      { nombre: "CERVEZA IMPORTADA", cantidad: 3, precio_unit: 12000, total: 24000, nota: "2x1 martes: se cobran 2 de 3" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 3000, total: 3000 },
      { nombre: "GASEOSA", cantidad: 11, precio_unit: 0, total: 0, nota: "Mezclador" },
    ],
    cocteles: [
      { nombre: "K MARGARITA", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1 martes: 1 de 2" },
      { nombre: "SODA ITALIANA", cantidad: 1, precio_unit: 15000, total: 15000 },
      { nombre: "JUGO EN AGUA", cantidad: 1, precio_unit: 5000, total: 5000 },
    ],
    nota: "MARTES 30 JUN - CIERRE DE JUNIO. Día chico ($368.000), 2x1 martes. Neto -$55.000 por nómina $185k + gastos $67.6k (incluye turno pasado del 28 por $60k). Bajas: Importada -3, Nacional -17, Gaseosa -11, Tequila ML -1. REPOSICIONES (foto inventario): Corona +48, Importada +24, Nacional +60, Electrolit +6 (sin factura aportada). Estanco y cócteles cuadran al peso."
  },
  {
    date: "2026-07-01", total_estanco: 614000, total_cocteles: 144000, total: 758000, total_units: 48,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 23, precio_unit: 9000, total: 207000 },
      { nombre: "TEQUILA BOTELLA", cantidad: 1, precio_unit: 195000, total: 195000, nota: "1 botella (carta $195k)" },
      { nombre: "CERVEZA IMPORTADA", cantidad: 6, precio_unit: 13000, total: 78000 },
      { nombre: "RON DL", cantidad: 2, precio_unit: 20000, total: 40000, nota: "Trago doble" },
      { nombre: "CERVEZA CORONA", cantidad: 2, precio_unit: 13000, total: 26000 },
      { nombre: "GINEBRA DL", cantidad: 1, precio_unit: 20000, total: 20000, nota: "Trago doble" },
      { nombre: "VODKA DL", cantidad: 1, precio_unit: 20000, total: 20000, nota: "Trago doble" },
      { nombre: "GINEBRA ML", cantidad: 2, precio_unit: 8000, total: 16000, nota: "Residual para cuadrar al POS (PVP por confirmar)" },
      { nombre: "AGUA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "GASEOSA", cantidad: 1, precio_unit: 6000, total: 6000, nota: "Cobrada como bebida" },
    ],
    cocteles: [
      { nombre: "K LONG ISLAND", cantidad: 4, precio_unit: 36000, total: 72000, nota: "2x1: 4 vendidos, se cobran 2" },
      { nombre: "K COSMOPOLITAN", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1: 2 vendidos, se cobra 1" },
      { nombre: "K MARTINI DRY", cantidad: 2, precio_unit: 36000, total: 36000, nota: "2x1: 2 vendidos, se cobra 1" },
    ],
    nota: "MIÉRCOLES 01 JUL. Estanco $614k reconstruye exacto (incluye 1 tequila botella $195k). Cócteles $144k = 8 K-cócteles en 2x1 (se cobran 4 x $36k). Bajas whole-unit: Agua -1, Corona -2, Importada -6, Nacional -23, Gaseosa -1, Ginebra DL -1, Ginebra ML -2, Ron DL -2, Vodka DL -1, Tequila botella -1. FLAG: nómina Gabriela 28-jun $60k puede duplicar el 'turno pasado 28' ya cargado el 30-jun."
  },
  {
    date: "2026-07-02", total_estanco: 579000, total_cocteles: 272000, total: 851000, total_units: 62,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 13, precio_unit: 9000, total: 117000 },
      { nombre: "AGTE BOTELLA ANTIOQUEÑO", cantidad: 1, precio_unit: 90000, total: 90000, nota: "Carta $90k" },
      { nombre: "AMARILLO BOT", cantidad: 4, precio_unit: 19250, total: 77000, nota: "SKU NUEVO — PVP por confirmar carta; total residual para cuadrar al POS" },
      { nombre: "CERVEZA CORONA", cantidad: 5, precio_unit: 13000, total: 65000 },
      { nombre: "AGTE MEDIA ANTIOQUEÑO", cantidad: 1, precio_unit: 60000, total: 60000, nota: "Carta media $60k" },
      { nombre: "RESERVA", cantidad: 1, precio_unit: 45000, total: 45000, nota: "PVP histórico $45k (confirmar)" },
      { nombre: "RON DL", cantidad: 2, precio_unit: 20000, total: 40000, nota: "Trago doble" },
      { nombre: "LICOR DE MANZANA", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Baja 1 unidad inventario" },
      { nombre: "VODKA DL", cantidad: 1, precio_unit: 20000, total: 20000, nota: "Trago doble" },
      { nombre: "CERVEZA IMPORTADA", cantidad: 1, precio_unit: 13000, total: 13000 },
      { nombre: "AGUA TONICA", cantidad: 1, precio_unit: 8000, total: 8000 },
      { nombre: "ELECTROLIT", cantidad: 1, precio_unit: 8000, total: 8000 },
      { nombre: "GASEOSA", cantidad: 20, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -20)" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "WHISKY COCT", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
    ],
    cocteles: [
      { nombre: "K PECERA LA SALA", cantidad: 1, precio_unit: 95000, total: 95000, nota: "Carta pecera $95k" },
      { nombre: "MICHELADA", cantidad: 4, precio_unit: 12000, total: 48000 },
      { nombre: "K GIN TONIC", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MARGARITA", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K ORGASMO MULTIPLE", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "LIMONADA NATURAL", cantidad: 1, precio_unit: 21000, total: 21000, nota: "Residual para cuadrar cócteles al POS (PVP típico ~$12k, confirmar)" },
    ],
    nota: "JUEVES 02 JUL. Estanco $579k y cócteles $272k = totales POS autoritativos. Ventas cruzan exacto con columna Sal del inventario. PVP por línea reconstruidos con carta; ítems nuevos/ambiguos (AMARILLO BOT ×4, RESERVA, LIMONADA NATURAL) llevan PVP estimado y cierran al total POS vía residual — confirmar con carta. Reposiciones del día (tirilla Ent): Gaseosa +29, Vodka DL +4, Whisky Coct +2, Amarillo Bot +2."
  },
  {
    date: "2026-07-03", total_estanco: 903000, total_cocteles: 565000, total: 1468000, total_units: 191,
    estanco: [
      { nombre: "CERVEZA CORONA", cantidad: 42, precio_unit: 13000, total: 546000, nota: "PVP carta; ver ajuste promo" },
      { nombre: "CERVEZA NACIONAL", cantidad: 50, precio_unit: 9000, total: 450000, nota: "PVP carta; ver ajuste promo" },
      { nombre: "CERVEZA IMPORTADA", cantidad: 6, precio_unit: 13000, total: 78000 },
      { nombre: "AGTE MEDIA ANTIOQUEÑO", cantidad: 2, precio_unit: 60000, total: 120000 },
      { nombre: "AGTE BOTELLA ANTIOQUEÑO", cantidad: 1, precio_unit: 90000, total: 90000 },
      { nombre: "AGTE BOTELLA CAUCANO", cantidad: 1, precio_unit: 90000, total: 90000 },
      { nombre: "TRAGO DOBLE WHISKYE", cantidad: 3, precio_unit: 20000, total: 60000, nota: "Bajan 1 Old Parr botella + 1 Buchanan's media (inventario)" },
      { nombre: "RON CALDAS BOT", cantidad: 1, precio_unit: 30000, total: 30000 },
      { nombre: "ELECTROLIT", cantidad: 3, precio_unit: 8000, total: 24000 },
      { nombre: "RED BULL", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 8000, total: 8000 },
      { nombre: "AGUA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "GASEOSA", cantidad: 38, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -38)" },
      { nombre: "GASEOSA 1.5", cantidad: 2, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "WHISKY OLD PAR BOTELLA", cantidad: 1, precio_unit: 0, total: 0, nota: "Baja de botella para tragos (no venta unitaria)" },
      { nombre: "WHISKY BUCHANANS MEDIA", cantidad: 1, precio_unit: 0, total: 0, nota: "Baja para tragos" },
      { nombre: "AJUSTE PROMOCIÓN/CORTESÍA VIERNES (por confirmar)", cantidad: 0, precio_unit: 0, total: -611000, nota: "FLAG: las unidades del tirillado a PVP carta ($1.514.000) superan el estanco POS ($903.000). Probable promo/cortesía/evento de cerveza. Confirmar para prorratear correctamente." },
    ],
    cocteles: [
      { nombre: "MICHELADA", cantidad: 12, precio_unit: 12000, total: 144000, nota: "Consumen 12 cervezas del inventario" },
      { nombre: "K PECERA LA SALA", cantidad: 1, precio_unit: 95000, total: 95000 },
      { nombre: "SODA ITALIANA", cantidad: 5, precio_unit: 15000, total: 75000 },
      { nombre: "LIMONADA NATURAL", cantidad: 6, precio_unit: 12000, total: 72000 },
      { nombre: "K FROZEN GRANIZADO", cantidad: 2, precio_unit: 36000, total: 72000, nota: "Granizado (aún en La Sala hasta ago-2026)" },
      { nombre: "K BLUE HAWAI", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K ENERGY", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K ULA ULA", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "LIMONADA DE COCO", cantidad: 3, precio_unit: 12000, total: 36000 },
      { nombre: "JUGO EN AGUA", cantidad: 2, precio_unit: 10000, total: 20000 },
      { nombre: "JUGO EN LECHE", cantidad: 1, precio_unit: 13000, total: 13000 },
      { nombre: "LIMONADA CEREZADA", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AJUSTE COCTELERÍA VIERNES (por confirmar)", cantidad: 0, precio_unit: 0, total: -82000, nota: "PVP carta suma $647.000 vs cócteles POS $565.000. Ajuste por promo/cortesía." },
    ],
    nota: "VIERNES 03 JUL — DÍA GRANDE (venta $2.715.400, 92% con tarjeta). Estanco $903k y cócteles $565k = totales POS autoritativos. Ventas cruzan exacto con columna Sal del inventario. IMPORTANTE: a PVP carta las unidades del tirillado superan ambos totales POS en ~$693k → probable PROMOCIÓN/CORTESÍA/EVENTO de cerveza (patrón conocido). Registrado con líneas de ajuste para cuadrar al POS; confirmar la promoción. Reposiciones del día (tirilla Ent): Gaseosa +48, Nacional +30, AGTE Anqueño botella +6, AGTE media Anqueño +2, Buchanan's botella +1. [CORRECCIÓN: Corona SIN reposición — la columna era Sal 42 no Ent; cierre Corona = 76−42 = 34, confirmado por apertura autoritativa del sábado.]"
  },
  {
    date: "2026-07-04", total_estanco: 125000, total_cocteles: 429000, total: 554000, total_units: 39,
    estanco: [
      { nombre: "GASEOSA", cantidad: 9, precio_unit: 6000, total: 54000, nota: "Cobrada como bebida" },
      { nombre: "CERVEZA NACIONAL", cantidad: 5, precio_unit: 9000, total: 45000 },
      { nombre: "AJUSTE / ítems estanco por confirmar (tirilla bar parcial)", cantidad: 0, precio_unit: 0, total: 26000, nota: "FLAG: la tirilla de bar del sábado luce parcial (solo 9 líneas). Estanco POS $125k > suma reconstruida $99k. Confirmar ítems faltantes." },
    ],
    cocteles: [
      { nombre: "LIMONADA NATURAL", cantidad: 9, precio_unit: 12000, total: 108000 },
      { nombre: "K MARGARITA", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K MOJITO", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K OLD FASHION", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "SODA ITALIANA", cantidad: 4, precio_unit: 15000, total: 60000 },
      { nombre: "LIMONADA DE COCO", cantidad: 4, precio_unit: 12000, total: 48000 },
      { nombre: "MICHELADA", cantidad: 2, precio_unit: 12000, total: 24000, nota: "Consumen 2 cervezas (Corona) del inventario" },
      { nombre: "AJUSTE cortesía/promo cócteles (por confirmar)", cantidad: 0, precio_unit: 0, total: -27000, nota: "PVP carta suma $456k vs cócteles POS $429k." },
    ],
    nota: "SÁBADO 04 JUL — DÍA CHICO ($1.145.600, muy por debajo del viernes). Estanco $125k y cócteles $429k = totales POS autoritativos. La tirilla de bar luce PARCIAL (solo 9 líneas, sección Baja de Coctelería vacía). Inventario físico bajó Nacional -5 (= bar), Gaseosa -9, Corona sin cambio. Sin reposiciones el sábado. (Confirmado por apertura del domingo: Nacional 265, Corona 34, Agua Tónica 11, Ginebra Botella 0.)"
  },
  {
    date: "2026-07-05", total_estanco: 21000, total_cocteles: 19000, total: 40000, total_units: 6,
    estanco: [
      { nombre: "GASEOSA", cantidad: 2, precio_unit: 6000, total: 12000, nota: "Cobrada como bebida" },
      { nombre: "CERVEZA NACIONAL", cantidad: 1, precio_unit: 9000, total: 9000 },
    ],
    cocteles: [
      { nombre: "MICHELADA", cantidad: 2, precio_unit: 6000, total: 12000, nota: "PVP reducido domingo (por confirmar)" },
      { nombre: "LIMONADA CEREZADA", cantidad: 1, precio_unit: 7000, total: 7000, nota: "Residual para cuadrar al POS" },
    ],
    nota: "DOMINGO 05 JUL — DÍA MÍNIMO ($151.000, sin tarjeta). Estanco $21k reconstruye exacto (Nacional 1 + Gaseosa 2). Cócteles $19k. Neto NEGATIVO -$69.800 (nómina $120k > contribución) — típico de domingo. Inventario: Nacional -1, Gaseosa -2. Sin reposiciones."
  },
  {
    date: "2026-07-06", total_estanco: 99000, total_cocteles: 421000, total: 520000, total_units: 32,
    estanco: [
      { nombre: "CERVEZA IMPORTADA", cantidad: 5, precio_unit: 13000, total: 65000 },
      { nombre: "CERVEZA NACIONAL", cantidad: 2, precio_unit: 9000, total: 18000 },
      { nombre: "CAJA DE VINO", cantidad: 1, precio_unit: 16000, total: 16000, nota: "Vino en caja; PVP estimado para cuadrar al POS" },
      { nombre: "GASEOSA", cantidad: 8, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -8)" },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería (margaritas)" },
      { nombre: "TRIPLE SEC", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería (margaritas)" },
    ],
    cocteles: [
      { nombre: "K MARGARITA", cantidad: 5, precio_unit: 36000, total: 180000 },
      { nombre: "K MARGARITA MIX", cantidad: 4, precio_unit: 36000, total: 144000, nota: "Margarita mix (asumido $36k, confirmar)" },
      { nombre: "K MOJITO", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "SODA ITALIANA", cantidad: 1, precio_unit: 15000, total: 15000 },
      { nombre: "MICHELADA", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AJUSTE cócteles (por confirmar)", cantidad: 0, precio_unit: 0, total: -2000, nota: "PVP carta suma $423k vs cócteles POS $421k." },
    ],
    nota: "LUNES 06 JUL. Noche de MARGARITAS: 9 margaritas (5 K Margarita + 4 Margarita Mix) impulsan cócteles $421k con estanco bajo $99k y pizzería mínima $66k. Neto alto $463.200 (79%) por nómina baja ($65k) y poca cocina. Estanco reconstruye exacto (Importada 5 + Nacional 2 + Caja Vino 1). Inventario: Importada -5, Nacional -2, Gaseosa -8, Caja Vino -1, Ginebra ML -1, Tequila ML -1, Triple Sec -1. Sin reposiciones."
  },
  {
    date: "2026-07-07", total_estanco: 1811000, total_cocteles: 292000, total: 2103000, total_units: 312,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 156, precio_unit: 4500, total: 702000, nota: "2x1 martes: 156 vendidas, se cobran 78 (@$9k)" },
      { nombre: "AGTE BOTELLA ANTIOQUEÑO", cantidad: 6, precio_unit: 90000, total: 540000 },
      { nombre: "AGTE BOTELLA CAUCANO", cantidad: 4, precio_unit: 90000, total: 360000 },
      { nombre: "CERVEZA CORONA", cantidad: 36, precio_unit: 6500, total: 234000, nota: "2x1 martes: se cobran 18 (@$13k)" },
      { nombre: "AGTE MEDIA ANTIOQUEÑO", cantidad: 3, precio_unit: 60000, total: 180000 },
      { nombre: "CERVEZA IMPORTADA", cantidad: 8, precio_unit: 6500, total: 52000, nota: "2x1 martes: se cobran 4 (@$13k)" },
      { nombre: "AGUA", cantidad: 6, precio_unit: 6000, total: 36000 },
      { nombre: "VODKA DL", cantidad: 1, precio_unit: 20000, total: 20000, nota: "Trago doble" },
      { nombre: "ELECTROLIT", cantidad: 2, precio_unit: 8000, total: 16000 },
      { nombre: "RED BULL", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AMARILLO BOT", cantidad: 1, precio_unit: 0, total: 0, nota: "SKU nuevo sin PVP" },
      { nombre: "AMARILLO MED", cantidad: 3, precio_unit: 0, total: 0, nota: "SKU nuevo sin PVP" },
      { nombre: "GASEOSA", cantidad: 26, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -26)" },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "LICOR DE MANZANA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "AJUSTE PROMOCIÓN/CORTESÍA MARTES (por confirmar)", cantidad: 0, precio_unit: 0, total: -341000, nota: "FLAG: aun con 2x1 en cerveza, las unidades a PVP carta ($2.152.000) superan el estanco POS ($1.811.000). Probable cortesía/evento adicional. Confirmar." },
    ],
    cocteles: [
      { nombre: "MICHELADA", cantidad: 35, precio_unit: 6000, total: 216000, nota: "2x1 martes: 35 vendidas, se cobran 18 (@$12k)" },
      { nombre: "K FROZEN GRANIZADO", cantidad: 3, precio_unit: 36000, total: 108000, nota: "Granizado (aún en La Sala hasta ago-2026)" },
      { nombre: "K DEMONIO VERDE", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K ULA ULA", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "SODA ITALIANA", cantidad: 2, precio_unit: 15000, total: 30000 },
      { nombre: "LIMONADA NATURAL", cantidad: 2, precio_unit: 12000, total: 24000 },
      { nombre: "LIMONADA CEREZADA", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "LIMONADA DE COCO", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "LIMONADA DE HIERBABUENA", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "JUGO EN LECHE", cantidad: 1, precio_unit: 13000, total: 13000 },
      { nombre: "AJUSTE cócteles martes (por confirmar)", cantidad: 0, precio_unit: 0, total: -279000, nota: "PVP carta suma $571k vs cócteles POS $292k (2x1 michelada + cortesías)." },
    ],
    nota: "MARTES 07 JUL — 2x1 MARTES INTENSO (venta $2.791.800). Estanco $1.811k y cócteles $292k = totales POS autoritativos. Ventas cruzan exacto con columna Sal del inventario. Enorme volumen de cerveza (156 Nacional, 36 Corona, 8 Importada) y 35 micheladas a 2x1. Aun con 2x1, las unidades a PVP carta superan los totales POS (~$620k) → probable cortesía/evento adicional además del 2x1. Reposiciones del día (tirilla Ent): Gaseosa +48, AGTE media Anqueño +6, Tequila ML +6, Corona +9, Ginebra ML +3, Gaseosa 1.5 +3, Licor Manzana +2, Triple Sec +1."
  },
  {
    date: "2026-07-08", total_estanco: 184000, total_cocteles: 10000, total: 194000, total_units: 24,
    estanco: [
      { nombre: "AGTE BOTELLA ANTIOQUEÑO", cantidad: 1, precio_unit: 90000, total: 90000 },
      { nombre: "CERVEZA NACIONAL", cantidad: 10, precio_unit: 9000, total: 90000 },
      { nombre: "AGUA", cantidad: 2, precio_unit: 2000, total: 4000, nota: "Residual para cuadrar al POS" },
      { nombre: "GASEOSA", cantidad: 6, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -6)" },
    ],
    cocteles: [
      { nombre: "MICHELADA", cantidad: 5, precio_unit: 2000, total: 10000, nota: "5 micheladas pero cócteles POS solo $10k → mayoría cortesía o incluidas con cerveza. Confirmar." },
    ],
    nota: "MIÉRCOLES 08 JUL — día flojo (venta $335.400, neto $32.280 tras nómina $185k). Estanco $184k (1 aguardiente + 10 nacional). Cócteles mínimos $10k con 5 micheladas (probable cortesía). Inventario: AGTE Anqueño -1, Nacional -10, Agua -2, Gaseosa -6. Sin reposiciones."
  },
  {
    date: "2026-07-09", total_estanco: 31000, total_cocteles: 4000, total: 35000, total_units: 29,
    estanco: [
      { nombre: "CERVEZA IMPORTADA", cantidad: 2, precio_unit: 13000, total: 26000 },
      { nombre: "CERVEZA NACIONAL", cantidad: 2, precio_unit: 9000, total: 18000 },
      { nombre: "RON CALDAS MEDIA", cantidad: 1, precio_unit: 0, total: 0, nota: "Baja de media botella para tragos (no venta unitaria)" },
      { nombre: "SMIRNOFF BOT", cantidad: 1, precio_unit: 0, total: 0, nota: "SKU sin PVP en catálogo (flag Smirnoff)" },
      { nombre: "WHISKY COCT", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "GASEOSA", cantidad: 20, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -20)" },
      { nombre: "AJUSTE cortesía/promo (por confirmar)", cantidad: 0, precio_unit: 0, total: -13000, nota: "PVP carta suma $44.000 vs estanco POS $31.000." },
    ],
    cocteles: [
      { nombre: "MICHELADA", cantidad: 2, precio_unit: 2000, total: 4000, nota: "2 micheladas pero cócteles POS solo $4.000 → probable cortesía (PVP carta $12k c/u)." },
    ],
    nota: "JUEVES 09 JUL — VENTA ANORMALMENTE BAJA ($74.600 vs $1.310.400 el jueves anterior). Sin tarjeta, solo $4.600 en efectivo. FLAG: ¿cierre anticipado, día no operativo o falta registro? Neto NEGATIVO -$27.080. Inventario: Importada -2, Nacional -2, Gaseosa -20 (+24 repo), Ron Caldas Media -1, Smirnoff Bot -1, Whisky Coct -1; reposiciones Corona +1, Gaseosa +24."
  },
  {
    date: "2026-07-10", total_estanco: 259000, total_cocteles: 372000, total: 631000, total_units: 54,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 21, precio_unit: 9000, total: 189000 },
      { nombre: "RON CALDAS BOTELLA", cantidad: 1, precio_unit: 110000, total: 110000, nota: "Botella repuesta y vendida el mismo día (Ent 1 / Sal 1)" },
      { nombre: "RESERVA", cantidad: 1, precio_unit: 45000, total: 45000, nota: "PVP histórico $45k (confirmar)" },
      { nombre: "CERVEZA CORONA", cantidad: 3, precio_unit: 13000, total: 39000 },
      { nombre: "COPA DE VINO", cantidad: 1, precio_unit: 15000, total: 15000, nota: "PVP estimado; servida de botella abierta (Vino Botella sin baja)" },
      { nombre: "AGUA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "AGUA TONICA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "GASEOSA", cantidad: 14, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -14)" },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "AJUSTE PROMOCIÓN/CORTESÍA VIERNES (por confirmar)", cantidad: 0, precio_unit: 0, total: -151000, nota: "FLAG: unidades a PVP carta ($410.000) vs estanco POS ($259.000)." },
    ],
    cocteles: [
      { nombre: "K DAIQUIRI DE FRESAS", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K GIN TONIC", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K GUAYACAN SERIO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K LONG ISLAND", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MARGARITA", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MARGARITA MIX", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K PIÑA COLADA CON LICOR", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "LIMONADA CEREZADA", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "LIMONADA DE HIERBABUENA", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "MICHELADA", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AJUSTE cócteles — POS SUPERIOR a carta (por confirmar)", cantidad: 0, precio_unit: 0, total: 84000, nota: "FLAG INVERSO: cócteles POS ($372.000) SUPERAN la suma a PVP carta ($288.000) en $84.000. Los PVP reales de coctelería probablemente son mayores a $36k, o Reserva/Copa de vino se facturan como cóctel. Confirmar carta vigente." },
    ],
    nota: "VIERNES 10 JUL (venta $1.581.200, 80% tarjeta). NOCHE DE LASAGNAS: cocina $950.200 = 62% de la venta, con 6 lasagnas de pollo + 3 mixtas. Estanco $259k y cócteles $372k = totales POS autoritativos. Ventas cruzan exacto con columna Sal del inventario. OJO: el tirillado de inventario venía rotulado 'Viernes 11 Julio' (el 11 es sábado) — corresponde al viernes 10 (cuadre impreso 07/11 02:30). Sin reposiciones salvo Ron Caldas botella +1."
  },
  {
    date: "2026-07-11", total_estanco: 262000, total_cocteles: 407000, total: 669000, total_units: 57,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 16, precio_unit: 9000, total: 144000 },
      { nombre: "AGTE MEDIA CAUCANO", cantidad: 1, precio_unit: 60000, total: 60000 },
      { nombre: "RON DL", cantidad: 2, precio_unit: 20000, total: 40000, nota: "ANOMALÍA: 2 tragos dobles de ron vendidos con inventario de ron en CERO (Ron Caldas botella y media = 0 desde el 10-jul). Ron servido de botella no registrada. Verificar." },
      { nombre: "CERVEZA IMPORTADA", cantidad: 3, precio_unit: 13000, total: 39000 },
      { nombre: "CERVEZA CORONA", cantidad: 2, precio_unit: 13000, total: 26000 },
      { nombre: "AGUA TONICA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "GASEOSA", cantidad: 15, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -15)" },
      { nombre: "AJUSTE cortesía/promo sábado (por confirmar)", cantidad: 0, precio_unit: 0, total: -53000, nota: "PVP carta suma $315.000 vs estanco POS $262.000." },
    ],
    cocteles: [
      { nombre: "K MOJITO", cantidad: 5, precio_unit: 36000, total: 180000, nota: "Consumen ron (sin stock registrado — ver anomalía RON DL)" },
      { nombre: "K GIN TONIC", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "LIMONADA NATURAL", cantidad: 4, precio_unit: 12000, total: 48000 },
      { nombre: "K MARGARITA", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K PIÑA COLADA CON LICOR", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "SODA ITALIANA", cantidad: 2, precio_unit: 15000, total: 30000 },
      { nombre: "LIMONADA DE COCO", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "MICHELADA", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AJUSTE cócteles (por confirmar)", cantidad: 0, precio_unit: 0, total: -19000, nota: "PVP carta suma $426.000 vs cócteles POS $407.000." },
    ],
    nota: "SÁBADO 11 JUL (venta $1.053.800). Noche de MOJITOS (5) — cócteles $407k > estanco $262k. Efectivo casi nulo ($1.850), 67% tarjeta. SIN FOTO DE INVENTARIO: el cierre de inventario de este día es DERIVADO (apertura 10-jul menos ventas del bar), no verificado contra tirilla física. ANOMALÍA: 2 RON DL vendidos + 5 mojitos con stock de ron en CERO."
  },
  {
    date: "2026-07-12", total_estanco: 104000, total_cocteles: 844000, total: 948000, total_units: 55,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 12, precio_unit: 9000, total: 108000, nota: "RESUELTO: la apertura del lunes 13 muestra 69 (no 71), confirmando que sí salieron las 12 unidades. Cierre del 12-jul corregido 71→69." },
      { nombre: "CERVEZA IMPORTADA", cantidad: 6, precio_unit: 13000, total: 78000 },
      { nombre: "AGUA TONICA", cantidad: 3, precio_unit: 0, total: 0, nota: "Mezclador de los 4 K Gin Tonic (baja inventario -3)" },
      { nombre: "GASEOSA", cantidad: 6, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -6)" },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "AJUSTE cortesía/promo domingo (por confirmar)", cantidad: 0, precio_unit: 0, total: -82000, nota: "PVP carta suma $186.000 vs estanco POS $104.000." },
    ],
    cocteles: [
      { nombre: "K MOJITO", cantidad: 5, precio_unit: 36000, total: 180000 },
      { nombre: "K GIN TONIC", cantidad: 4, precio_unit: 36000, total: 144000 },
      { nombre: "K PECERA LA SALA", cantidad: 1, precio_unit: 95000, total: 95000 },
      { nombre: "K ORGASMO MULTIPLE", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "SODA ITALIANA", cantidad: 3, precio_unit: 15000, total: 45000 },
      { nombre: "K ACAPULCO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MEDUSA", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MOJITO MIX", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K PIÑA COLADA CON LICOR", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K PIÑA COLADA SIN LICOR", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K PUMPKIN PIE", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K ULA ULA", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "LIMONADA DE COCO", cantidad: 3, precio_unit: 12000, total: 36000 },
      { nombre: "LIMONADA NATURAL", cantidad: 3, precio_unit: 12000, total: 36000 },
      { nombre: "MICHELADA", cantidad: 2, precio_unit: 12000, total: 24000 },
      { nombre: "JUGO EN LECHE", cantidad: 1, precio_unit: 13000, total: 13000 },
      { nombre: "AROMATICA DE FRUTA", cantidad: 1, precio_unit: 8000, total: 8000, nota: "PVP estimado" },
      { nombre: "AJUSTE cócteles (por confirmar)", cantidad: 0, precio_unit: 0, total: -61000, nota: "PVP carta suma $905.000 vs cócteles POS $844.000." },
    ],
    nota: "DOMINGO 12 JUL — DÍA EXCEPCIONAL DE COCTELERÍA (venta $1.390.000, neto $961.400 = 69,2%, el mejor margen del mes). Cócteles $844k = 61% de la venta con 18 K-cócteles + 1 pecera. Nómina mínima ($70k) y gastos $5k → margen altísimo. Rompe el patrón de domingo flojo. DISCREPANCIA: bar reporta 12 Cerveza Nacional pero el inventario solo baja 10."
  },
  {
    date: "2026-07-13", total_estanco: 26000, total_cocteles: 60000, total: 86000, total_units: 11,
    estanco: [
      { nombre: "GASEOSA", cantidad: 5, precio_unit: 2000, total: 10000, nota: "Cobradas como bebida; PVP residual para cuadrar al POS" },
      { nombre: "CERVEZA NACIONAL", cantidad: 1, precio_unit: 9000, total: 9000 },
      { nombre: "GASEOSA 1.5", cantidad: 1, precio_unit: 7000, total: 7000, nota: "PVP estimado" },
    ],
    cocteles: [
      { nombre: "LIMONADA DE COCO", cantidad: 2, precio_unit: 12000, total: 24000 },
      { nombre: "SODA ITALIANA", cantidad: 1, precio_unit: 15000, total: 15000 },
      { nombre: "LIMONADA CEREZADA", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AJUSTE cócteles — POS superior a carta", cantidad: 0, precio_unit: 0, total: 9000, nota: "Cócteles POS $60.000 vs carta $51.000. Refuerza el flag de PVP de coctelería desactualizados." },
    ],
    nota: "LUNES 13 JUL — bar mínimo ($26k estanco + $60k cócteles), la venta la sostuvo la cocina ($338.400 = 80%). Neto NEGATIVO -$49.320: la pizzería deja solo el 20% y no alcanza a cubrir nómina $125k + gastos $78k. Inventario verificado: Nacional 69→68, Gaseosa 91→86, Gaseosa 1.5 18→17 (coinciden exacto con la foto final). Sin reposiciones."
  },
  {
    date: "2026-07-14", total_estanco: 40000, total_cocteles: 427000, total: 467000, total_units: 33,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 6, precio_unit: 4500, total: 27000, nota: "2x1 martes: 6 vendidas, se cobran 3 (@$9k)" },
      { nombre: "CERVEZA IMPORTADA", cantidad: 1, precio_unit: 13000, total: 13000 },
      { nombre: "GASEOSA", cantidad: 4, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -4)" },
      { nombre: "GASEOSA 1.5", cantidad: 1, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "GINEBRA DL", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería (burbujas azules)" },
      { nombre: "RON DL", cantidad: 3, precio_unit: 0, total: 0, nota: "Insumo coctelería (cuba libre, coco loco)" },
      { nombre: "TEQUILA ML", cantidad: 2, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TRIPLE SEC", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
    ],
    cocteles: [
      { nombre: "K SPACEBOOM", cantidad: 6, precio_unit: 36000, total: 216000, nota: "Cóctel estrella de la noche" },
      { nombre: "K BURBUJAS AZULES", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K COCO LOCO", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K CUBA LIBRE", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K DEMONIO VERDE", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K LONG ISLAND", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K PIÑA COLADA CON LICOR", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K PECERA LA SALA", cantidad: 1, precio_unit: 95000, total: 95000 },
      { nombre: "AJUSTE 2x1 MARTES cócteles", cantidad: 0, precio_unit: 0, total: -280000, nota: "17 K-cócteles + pecera a PVP carta = $707.000 vs cócteles POS $427.000. Consistente con 2x1 de martes aplicado a coctelería." },
    ],
    nota: "MARTES 14 JUL — 2x1 MARTES. Estanco reconstruye EXACTO con 2x1 (6 nacionales cobradas como 3 + 1 importada = $40.000), confirmando la mecánica de la promo. Cócteles $427k con 17 K-cócteles + 1 pecera: noche de SPACEBOOM (6 uds). Cocina mínima ($128.200). Neto $302.640 (50,8%). Inventario: los 8 movimientos coinciden EXACTO con la foto final (Importada 31, Nacional 62, Gaseosa 82, Gaseosa 1.5 16, Ginebra DL 1, Ron DL 0, Tequila ML 1, Triple Sec 2). Sin reposiciones."
  },
  {
    date: "2026-07-15", total_estanco: 43000, total_cocteles: 78000, total: 121000, total_units: 17,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 2, precio_unit: 9000, total: 18000 },
      { nombre: "AGUA", cantidad: 2, precio_unit: 6000, total: 12000 },
      { nombre: "GASEOSA", cantidad: 6, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -6)" },
      { nombre: "AJUSTE / ítems estanco por confirmar", cantidad: 0, precio_unit: 0, total: 13000, nota: "Estanco POS $43.000 vs reconstrucción $30.000. Residual $13.000 (probables gaseosas cobradas como bebida)." },
    ],
    cocteles: [
      { nombre: "K ORGASMO MULTIPLE", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "MICHELADA", cantidad: 3, precio_unit: 12000, total: 36000, nota: "OJO: 3 micheladas pero el inventario de cerveza baja solo 2 unidades (las del estanco). Verificar de dónde sale la cerveza de las micheladas." },
      { nombre: "COPA DE SANGRIA", cantidad: 1, precio_unit: 15000, total: 15000, nota: "PVP estimado" },
      { nombre: "JUGO EN LECHE", cantidad: 1, precio_unit: 13000, total: 13000 },
      { nombre: "AJUSTE cócteles (por confirmar)", cantidad: 0, precio_unit: 0, total: -58000, nota: "PVP carta suma $136.000 vs cócteles POS $78.000." },
    ],
    nota: "MIÉRCOLES 15 JUL — día flojo (venta $315.600, neto NEGATIVO -$9.080). La cocina fue el 62% ($194.600) pero al dejar solo el 20% no cubre nómina $125k + gastos $44k. REPOSICIÓN GRANDE: Cerveza Nacional +60 (62→120), verificada exacta contra la foto final. Agua 18→16 y Gaseosa 82→76 también coinciden exacto."
  },
  {
    date: "2026-07-16", total_estanco: 53000, total_cocteles: 174000, total: 227000, total_units: 57,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 21, precio_unit: 9000, total: 189000 },
      { nombre: "GINEBRA BOTELLA", cantidad: 1, precio_unit: 280000, total: 280000, nota: "Comprada y vendida el mismo día (Ent 1 / Sal 1)" },
      { nombre: "AGTE MEDIA ANTIOQUEÑO", cantidad: 2, precio_unit: 60000, total: 120000 },
      { nombre: "AGTE BOTELLA ANTIOQUEÑO", cantidad: 1, precio_unit: 90000, total: 90000 },
      { nombre: "AGTE MEDIA CAUCANO", cantidad: 1, precio_unit: 60000, total: 60000 },
      { nombre: "CERVEZA IMPORTADA", cantidad: 3, precio_unit: 13000, total: 39000 },
      { nombre: "AGUA", cantidad: 3, precio_unit: 6000, total: 18000 },
      { nombre: "CERVEZA CORONA", cantidad: 1, precio_unit: 13000, total: 13000 },
      { nombre: "VODKA ABSOLUT BOTELLA", cantidad: 1, precio_unit: 0, total: 0, nota: "Ent 1 / Sal 1 el mismo día; sin PVP en catálogo" },
      { nombre: "SMIRNOFF", cantidad: 1, precio_unit: 0, total: 0, nota: "Sin PVP (flag Smirnoff)" },
      { nombre: "CREMA DE WHISKY", cantidad: 1, precio_unit: 0, total: 0, nota: "Ent 1 / Sal 1 el mismo día" },
      { nombre: "LICOR DE MANZANA", cantidad: 2, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "GASEOSA", cantidad: 9, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -9)" },
      { nombre: "GASEOSA 1.5", cantidad: 2, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "AJUSTE ⚠️ EVENTO/CORTESÍA/TRASLADO SIN FACTURAR (por confirmar)", cantidad: 0, precio_unit: 0, total: -756000, nota: "⚠️ ALERTA MAYOR: las unidades que SALIERON FÍSICAMENTE del inventario (verificado: los 17 movimientos coinciden exacto con la tirilla) suman $809.000 a PVP carta, pero el estanco POS solo registra $53.000. Faltan ~$756.000 sin facturar. Posibles causas: evento privado no cargado al POS, cortesías masivas, traslado a El Búnker, o venta no registrada. REQUIERE ACLARACIÓN URGENTE." },
    ],
    cocteles: [
      { nombre: "K ORGASMO MULTIPLE", cantidad: 3, precio_unit: 36000, total: 108000 },
      { nombre: "K BLUE SKY", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "LIMONADA NATURAL", cantidad: 3, precio_unit: 12000, total: 36000 },
      { nombre: "SODA ITALIANA", cantidad: 1, precio_unit: 15000, total: 15000 },
      { nombre: "AJUSTE cócteles (por confirmar)", cantidad: 0, precio_unit: 0, total: -21000, nota: "PVP carta suma $195.000 vs cócteles POS $174.000." },
    ],
    nota: "JUEVES 16 JUL — ⚠️ DÍA CON ALERTA MAYOR DE ESTANCO. Venta $477.800, NÓMINA $0 (nadie en nómina ese día), neto $246.160. El inventario está PERFECTO (17 movimientos verificados uno a uno contra la tirilla, cero discrepancias), pero salieron ~$809.000 en producto a PVP carta contra un estanco POS de solo $53.000. Reposiciones del día: Gaseosa +48, Caja de vino +2, y Ginebra botella / Vodka Absolut / Crema de whisky / Whisky coct +1 c/u (varias compradas y despachadas el mismo día)."
  },
  {
    date: "2026-07-17", total_estanco: 566000, total_cocteles: 1212000, total: 1778000, total_units: 154,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 43, precio_unit: 9000, total: 387000 },
      { nombre: "AGTE MEDIA CAUCANO", cantidad: 2, precio_unit: 60000, total: 120000 },
      { nombre: "RON CALDAS BOTELLA", cantidad: 1, precio_unit: 110000, total: 110000, nota: "Repuesta y vendida el mismo día (Ent 1 / Sal 1)" },
      { nombre: "AGTE BOTELLA CAUCANO", cantidad: 1, precio_unit: 90000, total: 90000 },
      { nombre: "CERVEZA CORONA", cantidad: 2, precio_unit: 13000, total: 26000 },
      { nombre: "AGUA", cantidad: 4, precio_unit: 6000, total: 24000 },
      { nombre: "AGUA TONICA", cantidad: 3, precio_unit: 6000, total: 18000 },
      { nombre: "GASEOSA", cantidad: 22, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -22)" },
      { nombre: "GASEOSA 1.5", cantidad: 1, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "GINEBRA DL", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "GINEBRA ML", cantidad: 2, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TEQUILA ML", cantidad: 3, precio_unit: 0, total: 0, nota: "Insumo coctelería (margaritas, tequila sunrise)" },
      { nombre: "CURAZAO AZUL", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "DRY MARTINY", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería (martini dry)" },
      { nombre: "LICOR DE MENTA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "WHISKY COCT", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "AJUSTE promoción/cortesía estanco (por confirmar)", cantidad: 0, precio_unit: 0, total: -209000, nota: "PVP carta $775.000 vs estanco POS $566.000." },
    ],
    cocteles: [
      { nombre: "K MOJITO", cantidad: 15, precio_unit: 18000, total: 270000, nota: "2x1 viernes: 15 vendidos, se cobran ~7,5 (@$36k)" },
      { nombre: "K MARGARITA MIX", cantidad: 12, precio_unit: 18000, total: 216000, nota: "2x1 viernes" },
      { nombre: "K TEQUILA SUNRISE", cantidad: 8, precio_unit: 18000, total: 144000, nota: "2x1 viernes" },
      { nombre: "K MARGARITA", cantidad: 6, precio_unit: 18000, total: 108000, nota: "2x1 viernes" },
      { nombre: "K COCO LOCO", cantidad: 4, precio_unit: 18000, total: 72000, nota: "2x1 viernes" },
      { nombre: "K ENERGY", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 viernes" },
      { nombre: "K GIN TONIC", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 viernes" },
      { nombre: "K LONG ISLAND", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 viernes" },
      { nombre: "K MARTINI DRY", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 viernes" },
      { nombre: "K PIÑA COLADA CON LICOR", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 viernes" },
      { nombre: "K SPACEBOOM", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 viernes" },
      { nombre: "K TOM COLLINS", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 viernes" },
      { nombre: "K FROZEN GRANIZADO", cantidad: 1, precio_unit: 18000, total: 18000, nota: "2x1 viernes. Granizado (aún en La Sala hasta ago-2026)" },
      { nombre: "MICHELADA", cantidad: 3, precio_unit: 12000, total: 36000 },
      { nombre: "SODA ITALIANA", cantidad: 2, precio_unit: 15000, total: 30000 },
      { nombre: "LIMONADA DE HIERBABUENA", cantidad: 2, precio_unit: 12000, total: 24000 },
      { nombre: "LIMONADA NATURAL", cantidad: 2, precio_unit: 12000, total: 24000 },
      { nombre: "LIMONADA CEREZADA", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AJUSTE menor cócteles", cantidad: 0, precio_unit: 0, total: 6000, nota: "Diferencia residual de $6.000 sobre $1,2M — el modelo 2x1 explica el 99,5%." },
    ],
    nota: "VIERNES 17 JUL — EL MEJOR DÍA DEL MES (venta $2.522.800, neto $1.584.460 = 62,8%). ✅ HALLAZGO CLAVE: se CONFIRMA el 2x1 de coctelería los viernes. 60 K-cócteles a PVP completo darían $2.160.000; con 2x1 dan $1.080.000 + $126.000 de bebidas = $1.206.000, contra cócteles POS $1.212.000 (diferencia de solo $6.000 sobre $1,2M). Esto explica retroactivamente los 'ajustes' de viernes anteriores. Noche de MOJITOS (15) y MARGARITA MIX (12). Inventario: 18 verificaciones contra la tirilla, CERO discrepancias. Reposiciones: Ginebra DL +5, Tequila ML +6, Ron DL +5, Ginebra ML +3, Corona +2, Ron Caldas Bot +1, Amarillo Bot +1, Licor Manzana +1. [CORREGIDO con la apertura del sábado 18: la reposición de +5 era RON DL (no Ron Caldas Media) y Licor Café quedó en 0.]"
  },
  {
    date: "2026-07-18", total_estanco: 580000, total_cocteles: 1250000, total: 1830000, total_units: 126,
    estanco: [
      { nombre: "AGTE BOTELLA ANTIOQUEÑO", cantidad: 3, precio_unit: 90000, total: 270000 },
      { nombre: "TEQUILA BOTELLA", cantidad: 1, precio_unit: 195000, total: 195000, nota: "Repuesta y vendida el mismo día (Ent 1 / Sal 1)" },
      { nombre: "CERVEZA NACIONAL", cantidad: 21, precio_unit: 9000, total: 189000 },
      { nombre: "AGTE BOTELLA CAUCANO", cantidad: 2, precio_unit: 90000, total: 180000 },
      { nombre: "RON CALDAS BOTELLA", cantidad: 1, precio_unit: 110000, total: 110000, nota: "Repuesta y vendida el mismo día (Ent 1 / Sal 1)" },
      { nombre: "CERVEZA IMPORTADA", cantidad: 4, precio_unit: 13000, total: 52000 },
      { nombre: "AGUA", cantidad: 4, precio_unit: 6000, total: 24000 },
      { nombre: "ELECTROLIT", cantidad: 2, precio_unit: 8000, total: 16000 },
      { nombre: "CERVEZA CORONA", cantidad: 1, precio_unit: 13000, total: 13000 },
      { nombre: "GASEOSA", cantidad: 15, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -15)" },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TEQUILA ML", cantidad: 2, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TRIPLE SEC", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "LICOR DE MANZANA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "AJUSTE ⚠️ promoción/cortesía estanco (por confirmar)", cantidad: 0, precio_unit: 0, total: -469000, nota: "FLAG: PVP carta $1.049.000 vs estanco POS $580.000. Diferencia grande ($469.000) en un sábado SIN 2x1 (los cócteles del mismo día sí van casi a precio completo). Revisar." },
    ],
    cocteles: [
      { nombre: "K MOJITO", cantidad: 7, precio_unit: 36000, total: 252000 },
      { nombre: "K MEDUSA", cantidad: 6, precio_unit: 36000, total: 216000 },
      { nombre: "K DAIQUIRI DE FRESAS", cantidad: 4, precio_unit: 36000, total: 144000 },
      { nombre: "K MARGARITA", cantidad: 4, precio_unit: 36000, total: 144000 },
      { nombre: "K DULCE EMBRUJO", cantidad: 3, precio_unit: 36000, total: 108000 },
      { nombre: "K LONG ISLAND", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K TEQUILA SUNRISE", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K BLUE HAWAI", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K FROZEN GRANIZADO", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Granizado (aún en La Sala hasta ago-2026)" },
      { nombre: "K GUAYACAN SERIO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MANGO SMOOTHIE", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MOJITO MIX", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K ULA ULA", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "SODA ITALIANA", cantidad: 4, precio_unit: 15000, total: 60000 },
      { nombre: "MICHELADA", cantidad: 3, precio_unit: 12000, total: 36000 },
      { nombre: "LIMONADA DE COCO", cantidad: 2, precio_unit: 12000, total: 24000 },
      { nombre: "LIMONADA NATURAL", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "JUGO EN AGUA", cantidad: 1, precio_unit: 10000, total: 10000 },
      { nombre: "AJUSTE cócteles (por confirmar)", cantidad: 0, precio_unit: 0, total: -116000, nota: "PVP carta $1.366.000 vs cócteles POS $1.250.000. SIN 2x1 (91% del precio completo), confirmando que la promo 2x1 corre martes y viernes, no sábados." },
    ],
    nota: "SÁBADO 18 JUL — segundo mejor día del mes (venta $2.394.800, neto $1.792.910 = 74,9%, el MEJOR margen del mes gracias a NÓMINA $0). ✅ Los cócteles van casi a PRECIO COMPLETO (91%), confirmando que el 2x1 corre martes y viernes, NO sábados. Noche de MOJITOS (7) y MEDUSA (6). 'Otros' $14.000 = Chiscake. Inventario: 17 verificaciones contra la tirilla, CERO discrepancias. GRAN REPOSICIÓN: Nacional +162, Corona +48, Electrolit +18, Ron Caldas Bot +1, Tequila Botella +1."
  },
  {
    date: "2026-07-19", total_estanco: 86000, total_cocteles: 404000, total: 490000, total_units: 40,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 7, precio_unit: 9000, total: 63000 },
      { nombre: "CERVEZA IMPORTADA", cantidad: 2, precio_unit: 13000, total: 26000 },
      { nombre: "CERVEZA CORONA", cantidad: 1, precio_unit: 13000, total: 13000 },
      { nombre: "AGUA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "AGUA TONICA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "RON DL", cantidad: 2, precio_unit: 0, total: 0, nota: "Insumo coctelería (long island, mojito)" },
      { nombre: "WHISKY OLD PAR MEDIA", cantidad: 1, precio_unit: 0, total: 0, nota: "Baja de media botella para tragos" },
      { nombre: "GASEOSA", cantidad: 8, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -8)" },
      { nombre: "AJUSTE cortesía/promo (por confirmar)", cantidad: 0, precio_unit: 0, total: -28000, nota: "PVP carta $114.000 vs estanco POS $86.000." },
    ],
    cocteles: [
      { nombre: "K DEMONIO VERDE", cantidad: 3, precio_unit: 36000, total: 108000 },
      { nombre: "K LONG ISLAND", cantidad: 3, precio_unit: 36000, total: 108000 },
      { nombre: "K GIN TONIC", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MOJITO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "SODA ITALIANA", cantidad: 2, precio_unit: 15000, total: 30000 },
      { nombre: "LIMONADA DE COCO", cantidad: 2, precio_unit: 12000, total: 24000 },
      { nombre: "LIMONADA NATURAL", cantidad: 2, precio_unit: 12000, total: 24000 },
      { nombre: "JUGO EN AGUA", cantidad: 2, precio_unit: 10000, total: 20000 },
      { nombre: "AROMATICA DE FRUTA", cantidad: 1, precio_unit: 8000, total: 8000, nota: "PVP estimado" },
      { nombre: "AJUSTE menor cócteles", cantidad: 0, precio_unit: 0, total: 10000, nota: "PVP carta $394.000 vs cócteles POS $404.000 (97,5% de precisión, sin promo)." },
    ],
    nota: "DOMINGO 19 JUL (venta $1.095.200, neto $406.040 = 37,1%). Buen domingo: la cocina fue el 55% ($605.200) con 4 alitas + 2 lasagnas de pollo, y los cócteles $404.000. Cócteles a precio COMPLETO (97,5% de precisión) — sin promo, consistente con el patrón (2x1 solo martes y viernes). Inventario: 12 verificaciones contra la tirilla, CERO discrepancias. Reposiciones: Agua +12, Agua tónica +6, Whisky Coct +1."
  },
  {
    date: "2026-07-20", total_estanco: 118000, total_cocteles: 363000, total: 481000, total_units: 42,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 15, precio_unit: 9000, total: 135000 },
      { nombre: "CERVEZA IMPORTADA", cantidad: 3, precio_unit: 13000, total: 39000 },
      { nombre: "AGUA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "GASEOSA", cantidad: 8, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -8)" },
      { nombre: "LICOR DE MANZANA", cantidad: 2, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "AJUSTE cortesía/promo (por confirmar)", cantidad: 0, precio_unit: 0, total: -62000, nota: "PVP carta $180.000 vs estanco POS $118.000." },
    ],
    cocteles: [
      { nombre: "K NUBARRON", cantidad: 3, precio_unit: 36000, total: 108000 },
      { nombre: "K COSMOPOLITAN", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "SODA ITALIANA", cantidad: 3, precio_unit: 15000, total: 45000 },
      { nombre: "K BLUE HAWAI", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K FROZEN GRANIZADO", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Granizado (aún en La Sala hasta ago-2026)" },
      { nombre: "K SUEÑO ROSA", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K ULA ULA", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "LIMONADA DE COCO", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AJUSTE cócteles (por confirmar)", cantidad: 0, precio_unit: 0, total: -18000, nota: "PVP carta $381.000 vs cócteles POS $363.000 (95% — sin promo, consistente con lunes)." },
    ],
    nota: "LUNES 20 JUL (venta $797.200, neto $179.490 = 22,5%). Cócteles $363.000 = 46% de la venta, sin promo (95% del precio de carta). Gastos altos del día ($179.750) recortan el margen. Inventario: 12 verificaciones contra la tirilla, CERO discrepancias. Sin reposiciones."
  },
  {
    date: "2026-07-21", total_estanco: 806000, total_cocteles: 275000, total: 1081000, total_units: 35,
    estanco: [
      { nombre: "GINEBRA BOTELLA", cantidad: 1, precio_unit: 280000, total: 280000, nota: "Comprada y vendida el mismo día (Ent 1 / Sal 1)" },
      { nombre: "WHISKY BUCHANANS BOTELLA", cantidad: 1, precio_unit: 250000, total: 250000, nota: "Comprada y vendida el mismo día (Ent 1 / Sal 1). ⚠️ ES LA DE 18 AÑOS, comprada el 21-jul por $411.000 (ver ledger de transferencias). El PVP de $250.000 acá es ESTIMADO y queda POR DEBAJO del costo. Aun sumándole los $144.000 del ajuste del día daría ~$394.000, todavía bajo costo. Confirmar PVP de carta del Buchanan's 18 años y corregir." },
      { nombre: "RESERVA", cantidad: 1, precio_unit: 45000, total: 45000, nota: "PVP histórico $45k (confirmar)" },
      { nombre: "CERVEZA NACIONAL", cantidad: 5, precio_unit: 9000, total: 45000 },
      { nombre: "CERVEZA CORONA", cantidad: 2, precio_unit: 13000, total: 26000 },
      { nombre: "ELECTROLIT", cantidad: 2, precio_unit: 8000, total: 16000 },
      { nombre: "GASEOSA", cantidad: 6, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -6)" },
      { nombre: "GASEOSA 1.5", cantidad: 1, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "LICOR DE MANZANA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "AJUSTE cortesía/promo (por confirmar)", cantidad: 0, precio_unit: 0, total: 144000, nota: "PVP carta $662.000 vs estanco POS $806.000 — POS SUPERIOR. Probable que Ginebra y Buchanan's botella tengan PVP mayor al estimado, o Reserva se cobre más alto." },
    ],
    cocteles: [
      { nombre: "K MARGARITA", cantidad: 4, precio_unit: 18000, total: 72000, nota: "2x1 martes" },
      { nombre: "K MOJITO", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 martes" },
      { nombre: "K TEQUILA SUNRISE", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 martes" },
      { nombre: "SODA ITALIANA", cantidad: 2, precio_unit: 15000, total: 30000 },
      { nombre: "LIMONADA CEREZADA", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AJUSTE cócteles martes", cantidad: 0, precio_unit: 0, total: 89000, nota: "Con 2x1: K-cócteles $144k + bebidas $42k = $186k vs cócteles POS $275.000. El POS es superior — parte de los cócteles pudo cobrarse sin 2x1, o Reserva entró como cóctel. Confirmar." },
    ],
    nota: "MARTES 21 JUL — NOCHE DE BOTELLAS (venta $1.419.200, NÓMINA $0, neto $1.117.280 = 78,7%, uno de los mejores márgenes del mes). El estanco $806k lo impulsan 1 Ginebra botella + 1 Buchanan's botella (ambas compradas y vendidas el mismo día) + Reserva. Cócteles $275k con 2x1. ✅ Inventario: 15 verificaciones contra la tirilla, CERO discrepancias, y el estanco POS es SUPERIOR a la reconstrucción — no hay faltante hoy. Reposiciones: Ginebra botella +1, Buchanan's botella +1."
  },
  {
    date: "2026-07-22", total_estanco: 132000, total_cocteles: 256000, total: 388000, total_units: 46,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 13, precio_unit: 4500, total: 58500, nota: "2x1 miércoles (mitad de $9.000)" },
      { nombre: "CERVEZA CORONA", cantidad: 3, precio_unit: 6500, total: 19500, nota: "2x1 miércoles (mitad de $13.000)" },
      { nombre: "GASEOSA", cantidad: 10, precio_unit: 6000, total: 54000, nota: "9 cobradas a $6.000 + 1 como mezclador ($0)" },
      { nombre: "CAJA DE VINO", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo Limonada de Vino (baja inventario -1)" },
      { nombre: "LICOR DE MANZANA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería (K Margarita Mix)" },
    ],
    cocteles: [
      { nombre: "K MARGARITA MIX", cantidad: 4, precio_unit: 18000, total: 72000, nota: "2x1 miércoles. SKU NUEVO — confirmar PVP carta $36.000" },
      { nombre: "K COCO LOCO", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 miércoles" },
      { nombre: "SODA ITALIANA", cantidad: 5, precio_unit: 15000, total: 75000 },
      { nombre: "LIMONADA NATURAL", cantidad: 4, precio_unit: 12000, total: 48000 },
      { nombre: "LIMONADA CEREZADA", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "LIMONADA DE VINO", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: 1000, nota: "Reconstrucción $255.000 vs cócteles POS $256.000 (99,6%). Diferencia mínima, probable 1 limonada a $13.000." },
    ],
    nota: "MIÉRCOLES 22 JUL — 🚩 CONFIRMA 2x1 EN MIÉRCOLES. Reconstrucción con 2x1 en cerveza y K-cócteles da $387.000 vs bar POS $388.000 (99,74% de precisión) y el estanco cierra EXACTO en $132.000. Sin 2x1 la reconstrucción daría $579.000, es decir un faltante ficticio de $191.000 — la promo es la explicación correcta, no un faltante. ✅ Inventario: 9 movimientos verificados contra tirilla, cero discrepancias; apertura del 22 = cierre del 21 sin corrección retroactiva. Reposiciones coctelería: Ginebra ML +4, Tequila ML +6, Triple Sec +2, Curazao Azul +1. Nómina $0, neto $490.160 (53,1%)."
  },
  {
    date: "2026-07-23", total_estanco: 35000, total_cocteles: 338000, total: 373000, total_units: 40,
    estanco: [
      { nombre: "GASEOSA", cantidad: 7, precio_unit: 5000, total: 35000, nota: "Cierra EXACTO con estanco POS $35.000. Catálogo dice $6.000 — confirmar PVP." },
      { nombre: "CERVEZA NACIONAL", cantidad: 15, precio_unit: 0, total: 0, nota: "🚩 SIN FACTURAR. Salieron 15 del inventario (Sal 15) y el POS no las registra. 1 probablemente es la base de la michelada. Carta $135.000, costo $51.000." },
      { nombre: "CERVEZA CORONA", cantidad: 3, precio_unit: 0, total: 0, nota: "🚩 SIN FACTURAR. Sal 3 sin registro POS. Carta $39.000, costo $11.400." },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "LICOR DE MANZANA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería (Apple/Martini)" },
      { nombre: "WHISKY COCT", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo: base de los 2 tragos dobles de whisky. Botella agotada (1→0)." },
    ],
    cocteles: [
      { nombre: "K PINA COLADA CON LIC", cantidad: 1, precio_unit: 47000, total: 47000 },
      { nombre: "K MOJITO", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K CUBA LIBRE", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K ENERGY", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MARTINI DRY", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K ORGASMO MULTIPLE", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "TRAGO DOBLE WHISKYE", cantidad: 2, precio_unit: 20000, total: 40000 },
      { nombre: "SODA ITALIANA", cantidad: 1, precio_unit: 15000, total: 15000 },
      { nombre: "LIMONADA DE COCO", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "MICHELADA", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: -4000, nota: "Reconstrucción a carta $342.000 vs cócteles POS $338.000 (98,8%). Residual menor — probable michelada o limonada a precio distinto. Totales POS mandan." },
    ],
    nota: "JUEVES 23 JUL — ⚠️ DOS HALLAZGOS. (1) REGLA 8 aplicada: la tirilla del BAR venía con la columna Venta CORRIDA UNA FILA HACIA ARRIBA (el '3' aparecía sobre CERVEZA CORONA y WHISKY COCT quedaba sin dato). La corrección de offset la CONFIRMA el inventario: Corona 3, Nacional 15, Gaseosa 7, Ginebra ML 1, Licor Manzana 1, Whisky Coct 1 cruzan los 6 exactos con la columna Sal. Leída como venía impresa, nada cuadraba. (2) 🚩 18 CERVEZAS SIN FACTURAR: salieron 15 Nacional + 3 Corona del inventario y el estanco POS es de solo $35.000, que alcanza justo para las 7 gaseosas. Hueco de ~$165.000-$174.000 a carta (~$59.000-$62.400 a costo). Jueves NO es día de 2x1, así que la promo no lo explica. Nómina $0 otra vez — mismo patrón que 16-jul y 18-jul. Reposición: Cerveza Importada +3."
  },
  {
    date: "2026-07-24", total_estanco: 586000, total_cocteles: 423000, total: 1009000, total_units: 65,
    estanco: [
      { nombre: "WHISKY OLD PAR MEDIA", cantidad: 1, precio_unit: 220000, total: 220000, nota: "Comprada y vendida el mismo día (Ent 1 / Sal 1). PVP carta confirmado en CATALOG." },
      { nombre: "VINO BOTELLA", cantidad: 3, precio_unit: 90000, total: 270000, nota: "Repuestas y vendidas el mismo día (Ent 3 / Sal 3). Gato Negro, PVP carta $90.000." },
      { nombre: "CERVEZA NACIONAL", cantidad: 10, precio_unit: 4500, total: 45000, nota: "2x1 viernes (mitad de $9.000)" },
      { nombre: "CERVEZA CORONA", cantidad: 5, precio_unit: 6500, total: 32500, nota: "2x1 viernes (mitad de $13.000)" },
      { nombre: "CERVEZA IMPORTADA", cantidad: 3, precio_unit: 6500, total: 19500, nota: "2x1 viernes (mitad de $13.000)" },
      { nombre: "AMARILLO BOT", cantidad: 1, precio_unit: 0, total: 0, nota: "🚩 Botella de aguardiente Amarillo fuera del inventario (1→0) sin ingreso asociado. El estanco ya cierra al 99,8% sin ella. SKU sin precio en catálogo (bandera abierta del mes). Confirmar si fue venta, cortesía o traslado." },
      { nombre: "GASEOSA", cantidad: 13, precio_unit: 0, total: 0, nota: "Mezclador de las botellas (baja inventario -13)" },
      { nombre: "AGUA TONICA", cantidad: 4, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -4)" },
      { nombre: "AGUA", cantidad: 1, precio_unit: 0, total: 0, nota: "Incluida con botella" },
      { nombre: "RED BULL", cantidad: 1, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "GINEBRA DL", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería (K Margarita)" },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: -1000, nota: "Reconstrucción $587.000 vs estanco POS $586.000 (99,83%). Totales POS mandan." },
    ],
    cocteles: [
      { nombre: "K ORGASMO MULTIPLE", cantidad: 3, precio_unit: 18000, total: 54000, nota: "2x1 viernes" },
      { nombre: "K MARGARITA", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 viernes" },
      { nombre: "K OLD FASHION", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 viernes" },
      { nombre: "K ALEXANDER", cantidad: 1, precio_unit: 18000, total: 18000, nota: "2x1 viernes" },
      { nombre: "K COSMOPOLITAN", cantidad: 1, precio_unit: 18000, total: 18000, nota: "2x1 viernes" },
      { nombre: "TRAGO DOBLE WHISKYE", cantidad: 2, precio_unit: 20000, total: 40000 },
      { nombre: "MICHELADA", cantidad: 3, precio_unit: 12000, total: 36000 },
      { nombre: "LIMONADA NATURAL", cantidad: 3, precio_unit: 12000, total: 36000 },
      { nombre: "SODA ITALIANA", cantidad: 1, precio_unit: 15000, total: 15000 },
      { nombre: "LIMONADA DE COCO", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "LIMONADA DE VINO", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "JUGO EN LECHE", cantidad: 1, precio_unit: 13000, total: 13000 },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: 97000, nota: "Reconstrucción con 2x1 $326.000 vs cócteles POS $423.000 — el POS es SUPERIOR, así que no hay faltante. Probable que parte de los 9 K-cócteles se cobrara sin 2x1, o que el Amarillo BOT entrara por esta categoría. Confirmar." },
    ],
    nota: "VIERNES 24 JUL — MEJOR DÍA DEL MES ($1.463.400). ✅ Inventario: 12 movimientos, cero discrepancias, apertura del 24 = cierre del 23 exacto y la tirilla del bar vino bien alineada (sin offset). El estanco lo impulsan 1 Old Parr media ($220.000, Ent 1/Sal 1) + 3 Vino botella ($270.000, Ent 3/Sal 3) + 18 cervezas a 2x1 → $587.000 vs POS $586.000 (99,83%). Cócteles POS $423.000 SUPERIOR a la reconstrucción de $326.000, o sea sin faltante. Gaseosas (13), tónicas (4), agua, red bull y ginebra DL van a $0 como mezcladores porque el estanco ya cierra sin ellos. Única bandera: 1 AMARILLO BOT salió del inventario sin ingreso asociado. Nómina $260.000 y gastos $114.260 (los más altos desde el 20-jul) recortan el neto a $725.620 (49,6%)."
  },
  {
    date: "2026-07-25", total_estanco: 464000, total_cocteles: 802000, total: 1266000, total_units: 106,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 20, precio_unit: 9000, total: 180000, nota: "Sábado sin 2x1, PVP completo" },
      { nombre: "CERVEZA IMPORTADA", cantidad: 10, precio_unit: 13000, total: 130000 },
      { nombre: "RON CALDAS BOTELLA", cantidad: 1, precio_unit: 110000, total: 110000, nota: "Comprada y vendida el mismo día (Ent 1 / Sal 1)" },
      { nombre: "AGT MEDIA ANQUEÑ", cantidad: 1, precio_unit: 60000, total: 60000 },
      { nombre: "AGT MEDIA CAUCA", cantidad: 1, precio_unit: 60000, total: 60000 },
      { nombre: "CERVEZA CORONA", cantidad: 2, precio_unit: 13000, total: 26000 },
      { nombre: "CERVEZA NACIONAL (base michelada)", cantidad: 5, precio_unit: 0, total: 0, nota: "5 de las 25 Nacional que salieron son la base de las 5 micheladas (cobradas en cócteles)" },
      { nombre: "GASEOSA", cantidad: 22, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -22)" },
      { nombre: "GASEOSA 1.5", cantidad: 1, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "AGUA TONICA", cantidad: 1, precio_unit: 0, total: 0, nota: "Mezclador (K Gin Tonic)" },
      { nombre: "GINEBRA ML", cantidad: 2, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TRIPLESEC", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: -102000, nota: "🚩 Reconstrucción a carta $566.000 vs estanco POS $464.000 (82,0%). Sábado NO es día de 2x1. Faltan ~$102.000 sin explicar." },
    ],
    cocteles: [
      { nombre: "K COSMOPOLITAN", cantidad: 4, precio_unit: 36000, total: 144000 },
      { nombre: "SODA ITALIANA", cantidad: 6, precio_unit: 15000, total: 90000 },
      { nombre: "K BURBUJAS AZULES", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "MICHELADA", cantidad: 5, precio_unit: 12000, total: 60000 },
      { nombre: "LIMONADA DE COCO", cantidad: 4, precio_unit: 12000, total: 48000 },
      { nombre: "K PINA COLADA CON LIC", cantidad: 1, precio_unit: 47000, total: 47000 },
      { nombre: "K ACAPULCO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K CAIPIRINHA", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K COCO LOCO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K DESTORNILLADOR", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K DULCE EMBRUJO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K FROZEN GRANIZADO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K GIN TONIC", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MOJITO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K NEW THE TIME", cantidad: 1, precio_unit: 36000, total: 36000, nota: "SKU NUEVO — asumido K-cóctel $36.000, confirmar carta" },
      { nombre: "LIMONADA DE HIERBABUENA", cantidad: 3, precio_unit: 12000, total: 36000 },
      { nombre: "LIMONADA NATURAL", cantidad: 3, precio_unit: 12000, total: 36000 },
      { nombre: "JUGO EN AGUA", cantidad: 1, precio_unit: 10000, total: 10000 },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: -65000, nota: "Reconstrucción a carta $867.000 vs cócteles POS $802.000 (92,5%). Faltan ~$65.000." },
    ],
    nota: "SÁBADO 25 JUL — DÍA MÁS GRANDE DEL MES ($2.315.400, cocina $1.049.400 récord con 31 platos). ✅ Inventario: 19 movimientos verificados, cero discrepancias; apertura del 25 = cierre del 24 exacto y la tirilla del bar vino bien alineada (12/12 cruces contra Sal). 🚩 GAP DE ~$167.000: reconstrucción a carta $1.433.000 vs bar POS $1.266.000 (88,3%). Sábado NO es día de 2x1, así que la promo no lo explica; mismo perfil que el sábado 18-jul (91%). Los 16 K-cócteles y las 37 cervezas se cobraron por debajo de carta. GRAN REPOSICIÓN del día (probable entrega de proveedor): Nacional +24, Gaseosa +60, Agua Tónica +6, Aguardiente botella Antioqueño +1 / Caucano +2, media Caucano +2, Caja de Vino +2, Amaretto +1, Amarillo BOT +1, Ron Caldas botella +1 y media +1, Whisky coctelería +1, Corona +1. ⚠️ El cuadre trae en la línea RES. un Vr.IVA de $60.000 (total $2.255.400 vs $2.315.400) que no aparece en TOT. — revisar si es descuento, retención o ítem anulado."
  },
  {
    date: "2026-07-26", total_estanco: 12000, total_cocteles: 169000, total: 181000, total_units: 16,
    estanco: [
      { nombre: "AGUA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "AGUA TONICA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "GASEOSA", cantidad: 5, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -5)" },
      { nombre: "VINO BOTELLA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo: botella abierta para servir 1 Copa de Vino ($15.000). Botella de $90.000 carta / $36.900 costo para una sola copa — revisar manejo." },
      { nombre: "WHISKY BUCHANANS BOTELLA", cantidad: 1, precio_unit: 0, total: 0, nota: "TRASLADO A EL BÚNKER (confirmado por Juanma). Botella salió del inventario (1→0) sin ingreso porque no fue venta: es traslado entre locales, registrado a $0 según la regla de transferencias de stock. Costo $156.800 — debe reflejarse como entrada en el inventario de El Búnker. NO es faltante." },
    ],
    cocteles: [
      { nombre: "K MOJITO MIX", cantidad: 2, precio_unit: 38000, total: 76000 },
      { nombre: "K BLUE HAWAI", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "SODA ITALIANA", cantidad: 2, precio_unit: 15000, total: 30000 },
      { nombre: "COPA DE VINO", cantidad: 1, precio_unit: 15000, total: 15000 },
      { nombre: "MICHELADA", cantidad: 1, precio_unit: 12000, total: 12000 },
    ],
    nota: "DOMINGO 26 JUL — DÍA MÁS FLOJO DEL MES ($266.200). ⚠️ REGLA 8 aplicada otra vez: la tirilla del BAR venía con la columna Venta CORRIDA UNA FILA HACIA ARRIBA (WHISKY BUCHANANS BOTELLA quedaba sin dato y el valor de AGUA se perdía arriba). El inventario confirma la corrección en 5/5 cruces: Agua 1, Agua Tónica 1, Gaseosa 5, Vino Botella 1, Buchanan's 1. Leída como venía impresa daba GASEOSA 1 contra Sal 5 — imposible. Con la corrección AMBAS categorías cierran EXACTAS y sin ajuste: estanco $12.000 = agua + tónica, y cócteles $169.000 = 2 Mojito Mix $38k + Blue Hawai $36k + 2 Soda $15k + Copa de Vino $15k + Michelada $12k. ✅ RESUELTO: la botella de Buchanan's que salió del inventario fue TRASLADO A EL BÚNKER (confirmado por Juanma), no faltante. Registrada a $0 con nota de traslado. Nómina $0, neto $157.390 (59,1%). Reposición: Nacional +12, Aguardiente botella Antioqueño +1, media Antioqueño +2."
  },
  {
    date: "2026-07-27", total_estanco: 40000, total_cocteles: 149000, total: 189000, total_units: 14,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 4, precio_unit: 9000, total: 36000, nota: "Lunes sin 2x1, PVP completo" },
      { nombre: "CERVEZA IMPORTADA", cantidad: 2, precio_unit: 13000, total: 26000 },
      { nombre: "JUGO EN AGUA", cantidad: 1, precio_unit: 10000, total: 10000 },
      { nombre: "AGUA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "GASEOSA", cantidad: 2, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -2)" },
      { nombre: "CAJA DE VINO", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo de la Limonada de Vino (baja inventario -1)" },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: -38000, nota: "🚩 Reconstrucción a carta $78.000 vs estanco POS $40.000 (51,3%). Lunes NO es día de 2x1. Faltan ~$38.000 — equivale aprox. a las 4 Nacional o a las 2 Importada + agua." },
    ],
    cocteles: [
      { nombre: "K PECERA LA SALA", cantidad: 1, precio_unit: 95000, total: 95000 },
      { nombre: "K PINA COLADA SIN LIC", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "LIMONADA DE VINO", cantidad: 1, precio_unit: 18000, total: 18000, nota: "Preparada con la Caja de Vino que bajó del inventario" },
    ],
    nota: "LUNES 27 JUL — DÍA CASI SIN MARGEN ($217.800 de venta, neto $12.510 = 5,7%). La nómina de $125.000 más gastos de $57.250 se comen casi toda la venta; es el patrón ya documentado de los días flojos con nómina alta. ✅ TIRILLAS REVISADAS FILA POR FILA: ambas vienen BIEN ALINEADAS, sin offset. Inventario: apertura del 27 = cierre del 26 exacto en los 53 SKUs, y los 6 movimientos cuadran (Agua -1, Caja de Vino -1, Importada -2, Nacional -4, Gaseosa -2, Crema de Whisky +1). El BAR cruza 5/5 contra la columna Sal. ✅ Cócteles cierran EXACTO sin ajuste: Pecera $95.000 + Piña Colada sin licor $36.000 + Limonada de Vino $18.000 = $149.000, los tres a precio de carta documentado. 🚩 Estanco sí queda corto: $78.000 reconstruidos vs $40.000 POS. ⚠️ TARJETA EN $0: toda la venta del día entró en efectivo, único día del mes así — verificar si el datáfono falló o si hubo ventas sin registrar en el medio de pago. Reposición: Crema de Whisky +1."
  },
  {
    date: "2026-07-28", total_estanco: 21000, total_cocteles: 185000, total: 206000, total_units: 14,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 3, precio_unit: 4500, total: 13500, nota: "2x1 martes (mitad de $9.000)" },
      { nombre: "GASEOSA", cantidad: 3, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -3)" },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: 7500, nota: "Reconstrucción con 2x1 $13.500 vs estanco POS $21.000 — el POS es SUPERIOR, no hay faltante. Las 3 cervezas o parte de las gaseosas se cobraron por encima de la reconstrucción." },
    ],
    cocteles: [
      { nombre: "K MARTINI DRY", cantidad: 4, precio_unit: 18000, total: 72000, nota: "2x1 martes" },
      { nombre: "K BLUE SKY", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 martes" },
      { nombre: "K PINA COLADA SIN LIC", cantidad: 1, precio_unit: 18000, total: 18000, nota: "2x1 martes" },
      { nombre: "SODA ITALIANA", cantidad: 1, precio_unit: 15000, total: 15000 },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: 44000, nota: "Reconstrucción con 2x1 $141.000 vs cócteles POS $185.000 — el POS es SUPERIOR, no hay faltante. Parte de los 7 K-cócteles se cobró sin 2x1." },
    ],
    nota: "MARTES 28 JUL — día pequeño y limpio ($277.800, neto $139.880 = 50,4%). ✅ TIRILLAS REVISADAS FILA POR FILA: ambas BIEN ALINEADAS, sin offset. Inventario con solo 2 movimientos (Nacional -3, Gaseosa -3), apertura del 28 = cierre del 27 exacta en los 53 SKUs, y el BAR cruza 2/2 contra Sal. ⚠️ EL BAR NO CIERRA CON NINGUNA REGLA DE PRECIO LIMPIA: con 2x1 completo la reconstrucción da $154.500 vs POS $206.000 (POS 33% arriba); a carta completa daría $312.000 (POS 34% abajo). No existe combinación entera de $36.000/$18.000 que dé los $185.000 de cócteles (la ecuación 18.000a = 44.000 no tiene solución entera), así que hubo precios manuales o el 2x1 se aplicó solo a parte de la noche. Como el POS queda POR ENCIMA de la reconstrucción con promo, NO hay faltante de producto — la incertidumbre es solo sobre el mix de precios. Sin reposiciones."
  },
  {
    date: "2026-07-29", total_estanco: 233000, total_cocteles: 449000, total: 682000, total_units: 61,
    estanco: [
      { nombre: "AGT MEDIA CAUCA", cantidad: 1, precio_unit: 60000, total: 60000 },
      { nombre: "AMARILLO MED", cantidad: 1, precio_unit: 60000, total: 60000, nota: "Ent 1 / Sal 1 el mismo día. PVP asumido igual a media de aguardiente ($60.000)" },
      { nombre: "RON DL", cantidad: 2, precio_unit: 20000, total: 40000, nota: "Trago doble" },
      { nombre: "CERVEZA NACIONAL", cantidad: 7, precio_unit: 4500, total: 31500, nota: "2x1 miércoles" },
      { nombre: "CERVEZA IMPORTADA", cantidad: 4, precio_unit: 6500, total: 26000, nota: "2x1 miércoles" },
      { nombre: "VODKA DL", cantidad: 1, precio_unit: 20000, total: 20000, nota: "Trago doble" },
      { nombre: "AGUA", cantidad: 3, precio_unit: 6000, total: 18000 },
      { nombre: "CERVEZA CORONA", cantidad: 1, precio_unit: 6500, total: 6500, nota: "2x1 miércoles" },
      { nombre: "AMARILLO BOT", cantidad: 1, precio_unit: 0, total: 0, nota: "🚩 SKU SIN PRECIO EN CATÁLOGO (bandera abierta del mes). Ent 1 / Sal 1 el mismo día. No se valoriza para no inventar precio; si se cobró a $90.000 de carta, el estanco cerraría muy por encima del POS." },
      { nombre: "AGUA TONICA", cantidad: 2, precio_unit: 0, total: 0, nota: "Mezclador (K Gin Tonic)" },
      { nombre: "GASEOSA", cantidad: 8, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -8)" },
      { nombre: "AMARETTO", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "CREMA DE WHISKY", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "LICOR DE MANZANA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: -29000, nota: "Reconstrucción $262.000 vs estanco POS $233.000 (88,9%). Faltan ~$29.000, sin contar el Amarillo BOT que va a $0 por no tener precio." },
    ],
    cocteles: [
      { nombre: "K MOJITO", cantidad: 6, precio_unit: 18000, total: 108000, nota: "2x1 miércoles" },
      { nombre: "K ACAPULCO", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 miércoles" },
      { nombre: "K BLUE HAWAI", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 miércoles" },
      { nombre: "K BURBUJAS AZULES", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 miércoles" },
      { nombre: "K COSMOPOLITAN", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 miércoles" },
      { nombre: "K DESTORNILLADOR", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 miércoles" },
      { nombre: "K DULCE EMBRUJO", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 miércoles" },
      { nombre: "K GIN TONIC", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 miércoles" },
      { nombre: "K MARGARITA MIX", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 miércoles" },
      { nombre: "K NUBARRON", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 miércoles. SKU NUEVO — asumido K-cóctel $36.000 carta, confirmar" },
      { nombre: "LIMONADA DE COCO", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: 5000, nota: "Reconstrucción con 2x1 $444.000 vs cócteles POS $449.000 (98,9%). El POS queda por ENCIMA, no hay faltante." },
    ],
    nota: "MIÉRCOLES 29 JUL — ✅ TERCERA CONFIRMACIÓN DEL 2x1 DE MIÉRCOLES: 24 K-cócteles a $18.000 + limonada = $444.000 vs cócteles POS $449.000 (98,9%), con el POS por encima. A carta completa habrían sido $876.000, o sea el doble del POS. ✅ Tirillas revisadas fila por fila: BIEN ALINEADAS. El BAR cruza 14/14 contra la columna Sal del inventario (media caucano 1, agua 3, tónica 2, amaretto 1, corona 1, importada 4, nacional 7, crema whisky 1, gaseosa 8, ginebra ML 1, licor manzana 1, ron DL 2, tequila ML 1, vodka DL 1) y las 16 filas con movimiento cumplen inicial+Ent−Sal=final. 🚩 Estanco corto: $262.000 reconstruidos vs $233.000 POS (−$29.000), y eso dejando el AMARILLO BOT a $0 por no tener precio de catálogo. GRAN REPOSICIÓN (la mayor del mes): Nacional +120, Corona +24, Importada +24, Gaseosa +24, Licor de Manzana +8, Ginebra ML +3, Tequila ML +3, Amarillo BOT +1, Amarillo MED +1. Nómina POS $0, neto $699.640 (80,0%) — pero ojo: las nóminas de estos días se están pagando por transferencia, no por caja (ver ledger). ⚠️ El cuadre trae otra vez en la línea RES. un Vr.IVA de $60.000 ($814.400 vs $874.400), igual que el 25-jul — es recurrente, no un error puntual."
  },
  {
    date: "2026-07-30", total_estanco: 82000, total_cocteles: 265000, total: 347000, total_units: 25,
    estanco: [
      { nombre: "CERVEZA CORONA", cantidad: 3, precio_unit: 13000, total: 39000, nota: "Jueves sin 2x1, PVP completo" },
      { nombre: "CERVEZA NACIONAL", cantidad: 2, precio_unit: 9000, total: 18000 },
      { nombre: "CERVEZA IMPORTADA", cantidad: 1, precio_unit: 13000, total: 13000 },
      { nombre: "JUGO MIX", cantidad: 1, precio_unit: 13000, total: 13000 },
      { nombre: "GASEOSA", cantidad: 7, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -7)" },
      { nombre: "LICOR DE MANZANA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería (K Margarita)" },
      { nombre: "VODKA BOTELLA", cantidad: 1, precio_unit: 0, total: 0, nota: "🚩 NO CRUZA CON EL INVENTARIO: la tirilla del BAR la lista, pero el inventario de VODKA BOTELLA está en 0 tanto en apertura como en cierre, sin Ent ni Sal. No hay stock del que pudiera salir. Probable error de digitación en el POS o botella servida desde otro registro. Registrada a $0 para no distorsionar. Carta $195.000, costo $89.000 — si fue venta real, falta ese ingreso." },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: -1000, nota: "Reconstrucción $83.000 vs estanco POS $82.000 (98,8%). Diferencia mínima — probable Jugo Mix a $12.000 en vez de $13.000. Totales POS mandan." },
    ],
    cocteles: [
      { nombre: "K MARGARITA", cantidad: 3, precio_unit: 36000, total: 108000 },
      { nombre: "K BLUE HAWAI", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K LONG INSLAND", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MOJITO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "COPA DE VINO", cantidad: 1, precio_unit: 15000, total: 15000 },
      { nombre: "LIMONADA NATURAL", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: 22000, nota: "Reconstrucción a carta $243.000 vs cócteles POS $265.000 (91,7%). El POS queda por ENCIMA, no hay faltante — probable que la Margarita se cobrara a $38.000 (precio histórico alternativo) o cargo extra." },
    ],
    nota: "JUEVES 30 JUL — ÚLTIMO DÍA DEL MES ($568.200, neto $214.880 = 37,8%). ✅ Tirillas revisadas fila por fila: BIEN ALINEADAS. Inventario: apertura del 30 = cierre del 29 exacto en los 53 SKUs; 9 movimientos verificados. El estanco cierra al 98,8% ($83.000 reconstruidos vs $82.000 POS) y los cócteles al 91,7% con el POS por encima, o sea sin faltante. 🚩 VODKA BOTELLA aparece en la tirilla del BAR pero NO tiene respaldo en inventario (saldo 0 en apertura y cierre, sin Ent ni Sal) — ver nota del ítem. 🚩 AMARILLO BOT: cierre del 29-jul quedó en 1 pero la foto de apertura del 30 muestra 0, sin Ent ni Sal y sin línea en el bar. Se aplicó la regla de foto-autoritativa (la apertura manda) y se registró el saldo en 0, pero el -1 queda SIN EXPLICAR. Es el mismo SKU que sigue sin precio de catálogo. Reposición de cierre de mes: Agua +24, Gaseosa +60, Licor de Manzana +3. Nómina $125.000 en caja."
  },
  {
    date: "2026-07-31", total_estanco: 623000, total_cocteles: 1014000, total: 1637000, total_units: 153,
    estanco: [
      { nombre: "CERVEZA CORONA", cantidad: 28, precio_unit: 6500, total: 182000, nota: "2x1 viernes (mitad de $13.000)" },
      { nombre: "CERVEZA NACIONAL", cantidad: 32, precio_unit: 4500, total: 144000, nota: "2x1 viernes (mitad de $9.000)" },
      { nombre: "AGT BOTLLA ANQUEÑ", cantidad: 1, precio_unit: 90000, total: 90000, nota: "Repuesta y vendida el mismo día (Ent 2 / Sal 1)" },
      { nombre: "RON CALDAS MEDIA", cantidad: 1, precio_unit: 80000, total: 80000, nota: "Repuesta y vendida el mismo día (Ent 2 / Sal 1)" },
      { nombre: "AGT MEDIA ANQUEÑ", cantidad: 1, precio_unit: 60000, total: 60000 },
      { nombre: "JUGO EN AGUA", cantidad: 2, precio_unit: 10000, total: 20000 },
      { nombre: "CERVEZA IMPORTADA", cantidad: 2, precio_unit: 6500, total: 13000, nota: "2x1 viernes" },
      { nombre: "AGUA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "AGUA TONICA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "GASEOSA", cantidad: 33, precio_unit: 0, total: 0, nota: "Mezclador de las botellas (baja inventario -33)" },
      { nombre: "GASEOSA 1.5", cantidad: 1, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "VINO BOTELLA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo: botella abierta para las 3 Copas de Vino y las 4 Copas de Sangría (cobradas en cócteles). Última botella, inventario queda en 0." },
      { nombre: "CAJA DE VINO", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo Limonada de Vino / Sangría" },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería (K Gin Tonic)" },
      { nombre: "LICOR DE MANZANA", cantidad: 2, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TEQUILA ML", cantidad: 2, precio_unit: 0, total: 0, nota: "Insumo coctelería (K Margarita)" },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: 22000, nota: "Reconstrucción $601.000 vs estanco POS $623.000 (96,5%). El POS queda por ENCIMA, no hay faltante — probable que parte de las 33 gaseosas se cobrara como producto y no solo como mezclador." },
    ],
    cocteles: [
      { nombre: "K MOJITO", cantidad: 7, precio_unit: 36000, total: 252000, nota: "⚠️ PRECIO COMPLETO pese a ser viernes (ver nota del día)" },
      { nombre: "K MARGARITA", cantidad: 4, precio_unit: 36000, total: 144000, nota: "Precio completo" },
      { nombre: "K FROZEN GRANIZADO", cantidad: 3, precio_unit: 36000, total: 108000, nota: "Precio completo" },
      { nombre: "SODA ITALIANA", cantidad: 6, precio_unit: 15000, total: 90000 },
      { nombre: "COPA DE SANGRIA", cantidad: 4, precio_unit: 15000, total: 60000 },
      { nombre: "MICHELADA", cantidad: 4, precio_unit: 12000, total: 48000 },
      { nombre: "COPA DE VINO", cantidad: 3, precio_unit: 15000, total: 45000 },
      { nombre: "LIMONADA DE COCO", cantidad: 3, precio_unit: 12000, total: 36000 },
      { nombre: "K CAIPIRINHA", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Precio completo" },
      { nombre: "K DAIQUIRI DE FRESAS", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Precio completo" },
      { nombre: "K DESTORNILLADOR", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Precio completo" },
      { nombre: "K GIN TONIC", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Precio completo" },
      { nombre: "LIMONADA DE HIERBABUENA", cantidad: 2, precio_unit: 12000, total: 24000 },
      { nombre: "TRAGO DOBLE", cantidad: 1, precio_unit: 20000, total: 20000 },
      { nombre: "LIMONADA CEREZADA", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "LIMONADA DE VINO", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: 19000, nota: "Reconstrucción a carta completa $995.000 vs cócteles POS $1.014.000 (98,1%). El POS queda por ENCIMA, no hay faltante." },
    ],
    nota: "VIERNES 31 JUL — CIERRE DE MES Y SEGUNDO MEJOR DÍA ($2.534.800). ✅ Tirillas BIEN ALINEADAS: el BAR cruza 15/15 contra la columna Sal del inventario y las 23 filas con movimiento cumplen inicial+Ent−Sal=final. Cocina récord de variedad: 19 productos distintos, 25 unidades, $881.800. 🚩 HALLAZGO IMPORTANTE — EL 2x1 SE APLICÓ A LA CERVEZA PERO NO A LOS CÓCTELES: las 62 cervezas a precio completo darían $678.000, por encima del estanco POS de $623.000, o sea que SÍ estuvieron a mitad de precio; en cambio los 18 K-cócteles a $18.000 darían $671.000 totales contra $1.014.000 del POS (POS 51% arriba), mientras que a carta completa dan $995.000 = 98,1%. Es el primer viernes del mes con promo partida — hasta ahora (17 y 24 jul) el 2x1 corría en ambas líneas. Confirmar si fue decisión del día o cambio de política para agosto. ✅ GASTOS $592.000 ITEMIZADOS (foto recibida): $370.000 son NÓMINA RETROACTIVA de martes 28 ($125.000), miércoles 29 ($185.000) y jueves 30 ($60.000) pagada el viernes desde caja; $147.000 reposición de inventario (2 canastas soda + 1 paca agua); $65.000 insumos coctelería (3 libras de coco); $10.000 comida personal. Solo $75.000 son gasto consumido real. ⚠️ La gran reposición de licores de este día NO está en estos gastos: se compró A CRÉDITO con Licores Junior (GIR), factura pendiente de recibir. Cargada en PRELOADED_CARTERA con valor ESTIMADO de $919.100 a costo de catálogo (el real será mayor: 6 Smirnoff y 2 Amarillo BOT no tienen precio de compra registrado). GRAN REPOSICIÓN DE CIERRE: Smirnoff +6, Ron Caldas botella +2 y media +2, Tequila botella +2, Amarillo BOT +2, Aguardiente Antioqueño botella +2, Buchanan's botella +1 y media +1, Old Parr botella +1 y media +1. El inventario de whiskies se repuso completo tras quedar en 0. VINO BOTELLA queda en 0."
  },
  {
    date: "2026-08-01", total_estanco: 120000, total_cocteles: 538000, total: 658000, total_units: 77,
    estanco: [
      { nombre: "AGT BOTLLA ANQUEÑ", cantidad: 5, precio_unit: 0, total: 0, nota: "TRASLADO A EL BÚNKER (confirmado por Juanma: las botellas se descargan de La Sala y se trasladan). NO es faltante ni venta. El SKU pasa de 5 a 0. Costo $47.100 c/u = $235.500 que debe entrar como existencia en El Búnker." },
      { nombre: "CERVEZA NACIONAL", cantidad: 29, precio_unit: 9000, total: 261000, nota: "Sábado sin 2x1, PVP completo" },
      { nombre: "RON CALDAS BOTELLA", cantidad: 1, precio_unit: 0, total: 0, nota: "TRASLADO A EL BÚNKER (misma regla). Costo $59.300 — debe entrar como existencia en El Búnker." },
      { nombre: "CERVEZA CORONA", cantidad: 3, precio_unit: 13000, total: 39000 },
      { nombre: "CERVEZA IMPORTADA", cantidad: 1, precio_unit: 13000, total: 13000 },
      { nombre: "AGUA", cantidad: 2, precio_unit: 6000, total: 12000 },
      { nombre: "AGUA TONICA", cantidad: 2, precio_unit: 6000, total: 12000 },
      { nombre: "GASEOSA", cantidad: 10, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -10)" },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería (K Gin Tonic)" },
      { nombre: "LICOR DE MANZANA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería (K Margarita / Tequila Sunrise)" },
      { nombre: "TRIPLESEC", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: -217000, nota: "Reconstrucción $337.000 (ya excluidas las 6 botellas trasladadas a El Búnker) vs estanco POS $120.000 (35,6%). Quedan ~$217.000 sin explicar, principalmente las 29 cervezas nacionales: a carta valen $261.000 y a mitad de precio $130.500, y aun así superan el estanco POS. Sábado no es día de 2x1. Pendiente de aclarar." },
    ],
    cocteles: [
      { nombre: "K PINA COLADA CON LIC", cantidad: 1, precio_unit: 47000, total: 47000 },
      { nombre: "K GIN TONIC", cantidad: 3, precio_unit: 36000, total: 108000 },
      { nombre: "K MARGARITA", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K TEQUILA SUNRISE", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K BLUE HAWAI", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K COCO LOCO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K LONG INSLAND", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K ORGASMO MULTIPLE", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K SUEÑO ROSA", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "MICHELADA", cantidad: 3, precio_unit: 12000, total: 36000 },
      { nombre: "SODA ITALIANA", cantidad: 2, precio_unit: 15000, total: 30000 },
      { nombre: "LIMONADA CEREZADA", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "LIMONADA DE COCO", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: -31000, nota: "Reconstrucción a carta $569.000 vs cócteles POS $538.000 (94,6%). Diferencia normal, dentro del rango del mes." },
    ],
    nota: "SÁBADO 1 AGO — PRIMER DÍA DE AGOSTO. Venta $1.074.000, neto POS $426.050 (39,7%). ✅ Tirillas BIEN ALINEADAS: el BAR cruza 12/12 contra la columna Sal y las filas con movimiento cumplen inicial+Ent−Sal=final. Cocina OK ($416.000, 12 unidades). Cócteles OK (94,6%). 🚩 ESTANCO AL 35,6% — PARCIALMENTE RESUELTO: salieron 5 botellas de Aguardiente Antioqueño (agotando el SKU) + 1 Ron Caldas botella, que Juanma confirmó como TRASLADO A EL BÚNKER (las botellas se descargan de La Sala y se trasladan). Esas 6 botellas ($294.800 a costo) NO son faltante y quedan a $0; deben entrar como existencia en El Búnker. Descontadas, la reconstrucción baja de $897.000 a $337.000 contra $120.000 del POS: quedan ~$217.000 sin explicar, sobre todo las 29 cervezas nacionales ($261.000 a carta, $130.500 a mitad de precio, ambas por encima del estanco POS). Sábado no es día de 2x1. ⚠️ La línea RES. del cuadre muestra un Vr.IVA de $536.000, el más alto visto (25-jul $60.000, 31-jul $100.000); conviene aclarar qué representa ese campo porque podría estar relacionado. ✅ CORRECCIÓN RETROACTIVA: la apertura del 1-ago muestra AGT MEDIA CAUCA en 4 y mi cierre del 31-jul decía 2; se aplicó la regla de foto-autoritativa y se corrigió el 31-jul a 4 (+2 unidades, $45.600 a costo). Reposiciones: Aguardiente botella Caucano +3, media Caucano... (ver inventario), Agua Tónica +6, Amarillo MED +2, Caja de Vino +2, Gaseosa +24, Vino Botella +2."
  },
  {
    date: "2026-08-02", total_estanco: 301000, total_cocteles: 0, total: 301000, total_units: 18,
    estanco: [
      { nombre: "TEQUILA MEDIA", cantidad: 1, precio_unit: 110000, total: 110000, nota: "PVP carta. Costo $43.950 (fuente por verificar en catálogo)." },
      { nombre: "CERVEZA NACIONAL", cantidad: 12, precio_unit: 9000, total: 108000, nota: "Domingo sin 2x1, PVP completo" },
      { nombre: "VINO BOTELLA", cantidad: 1, precio_unit: 90000, total: 90000, nota: "Gato Negro, PVP carta" },
      { nombre: "AGUA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "GASEOSA", cantidad: 2, precio_unit: 0, total: 0, nota: "Mezclador de las botellas (baja inventario -2)" },
      { nombre: "GASEOSA 1.5", cantidad: 1, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -1)" },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: -13000, nota: "Reconstrucción $314.000 vs estanco POS $301.000 (95,9%). Diferencia menor, dentro del rango normal. Totales POS mandan." },
    ],
    cocteles: [],
    nota: "DOMINGO 2 AGO — DÍA SIN COCTELERÍA. Venta $506.800, neto $211.020 (41,6%). ⚠️ CÓCTELES EN $0: primera vez en todo el período registrado que la línea de coctelería no factura nada, y la sección 'Baja de Coctelería' de la tirilla viene vacía. Como la coctelería es la línea más rentable (retiene el 100% del ingreso), un domingo sin cócteles es una señal a vigilar — verificar si faltó bartender, si la granizadora ya migró a El Búnker o si simplemente no hubo demanda. ✅ Tirillas BIEN ALINEADAS: el BAR cruza 6/6 contra la columna Sal y la apertura del 2-ago coincide EXACTA con el cierre del 1-ago en los 53 SKUs (sin corrección retroactiva). ✅ Estanco cierra al 95,9%: 1 Tequila media + 12 Nacional + 1 Vino botella + agua = $314.000 vs $301.000 POS. Muy limpio comparado con el 13,4% del sábado. Sin reposiciones. ⚠️ NÓMINA $0 en el POS con gastos de $113.950 — el patrón ya documentado: la nómina del domingo probablemente se pagará por transferencia o en el gasto de otro día. El neto de $211.020 está sobrestimado en ese monto."
  },
  {
    date: "2026-08-03", total_estanco: 24000, total_cocteles: 0, total: 24000, total_units: 7,
    estanco: [
      { nombre: "GASEOSA", cantidad: 4, precio_unit: 6000, total: 24000, nota: "Cierra EXACTO con el estanco POS de $24.000. Sin cócteles ni botellas el día, se cobran como producto." },
      { nombre: "CERVEZA NACIONAL", cantidad: 3, precio_unit: 0, total: 0, nota: "🚩 SIN FACTURAR. Salieron 3 del inventario (174→171) y el estanco POS de $24.000 ya queda cubierto exacto por las 4 gaseosas. Carta $27.000, costo ~$10.200. Monto menor pero es el mismo patrón recurrente." },
    ],
    cocteles: [],
    nota: "LUNES 3 AGO — DÍA EN PÉRDIDA (−$108.280). Venta $162.600, la más baja desde el 9 de julio. ⚠️ EL DÍA CIERRA EN ROJO POR LOS GASTOS: $160.000 de gastos contra $162.600 de venta, más el 80% de pizzería ($110.880) que se va al aliado. La cocina facturó $138.600 (85% de la venta del día) y de eso solo quedan $27.720 para La Sala. ⚠️ SEGUNDO DÍA SEGUIDO SIN COCTELERÍA (cócteles $0, sección 'Baja de Coctelería' vacía) — ya no parece casualidad del domingo: conviene verificar si hay bartender asignado esta semana o si la operación de coctelería se detuvo. ⚠️ TARJETA EN $0: toda la venta entró en efectivo ($2.600) más gastos; segundo día del período así (el otro fue el 27-jul). Sin datáfono no hay costo financiero. ✅ Tirillas BIEN ALINEADAS: el BAR cruza 2/2 contra la columna Sal y la apertura del 3-ago coincide EXACTA con el cierre del 2-ago en los 53 SKUs. Reposición: Gaseosa +54."
  },
  {
    date: "2026-08-04", total_estanco: 129000, total_cocteles: 616000, total: 745000, total_units: 63,
    estanco: [
      { nombre: "AGT MEDIA CAUCA", cantidad: 1, precio_unit: 60000, total: 60000, nota: "PVP carta" },
      { nombre: "CERVEZA CORONA", cantidad: 3, precio_unit: 6500, total: 19500, nota: "2x1 martes (mitad de $13.000)" },
      { nombre: "RON DL", cantidad: 1, precio_unit: 20000, total: 20000, nota: "Trago doble de ron" },
      { nombre: "CERVEZA NACIONAL", cantidad: 2, precio_unit: 4500, total: 9000, nota: "2x1 martes" },
      { nombre: "AGUA", cantidad: 1, precio_unit: 6000, total: 6000 },
      { nombre: "RON CALDAS MEDIA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo: media botella abierta para servir el trago doble de ron (RON DL). No se cobra aparte." },
      { nombre: "GASEOSA", cantidad: 12, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -12)" },
      { nombre: "GINEBRA DL", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TEQUILA ML", cantidad: 2, precio_unit: 0, total: 0, nota: "Insumo coctelería (K Margarita / Tequila Sunrise)" },
      { nombre: "WHISKEY COCTELERIA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería. Botella agotada (1→0)." },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: 14500, nota: "Reconstrucción con 2x1 $114.500 vs estanco POS $129.000 (88,8%). El POS queda por ENCIMA, no hay faltante — probable que las cervezas o parte de las gaseosas se cobraran sin promo." },
    ],
    cocteles: [
      { nombre: "K LONG INSLAND", cantidad: 6, precio_unit: 18000, total: 108000, nota: "2x1 martes" },
      { nombre: "K MOJITO", cantidad: 6, precio_unit: 18000, total: 108000, nota: "2x1 martes" },
      { nombre: "K PINA COLADA CON LIC", cantidad: 4, precio_unit: 23500, total: 94000, nota: "2x1 martes (mitad de $47.000)" },
      { nombre: "K MARGARITA", cantidad: 4, precio_unit: 18000, total: 72000, nota: "2x1 martes" },
      { nombre: "K MEXICO LINDO", cantidad: 4, precio_unit: 18000, total: 72000, nota: "2x1 martes" },
      { nombre: "K ACAPULCO", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 martes" },
      { nombre: "K BLUE HAWAI", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 martes" },
      { nombre: "K COCO LOCO", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 martes" },
      { nombre: "K ENERGY", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 martes" },
      { nombre: "K ORGASMO MULTIPLE", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 martes" },
      { nombre: "K TEQUILA SUNRISE", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 martes" },
      { nombre: "LIMONADA CEREZADA", cantidad: 2, precio_unit: 12000, total: 24000 },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: -78000, nota: "Reconstrucción con 2x1 $694.000 vs cócteles POS $616.000 (88,8%). Dentro del rango habitual de los días de promoción; el mix exacto de precios no es reconstruible al peso." },
    ],
    nota: "MARTES 4 AGO — VUELVE LA COCTELERÍA CON FUERZA. Venta $1.134.600, neto $623.450 (54,9%), el mejor margen de agosto. Tras dos días en cero, la coctelería facturó $616.000 con 36 K-cócteles, el 54,3% de la venta del día. ✅ Tirillas BIEN ALINEADAS: el BAR cruza 10/10 contra la columna Sal y la apertura del 4-ago coincide EXACTA con el cierre del 3-ago en los 53 SKUs. ✅ 2x1 de martes confirmado otra vez: a precio completo la coctelería habría dado $1.364.000 contra $616.000 del POS, imposible; con 2x1 da $694.000 (88,8%). 🚩 UNA PIZZA POLLO BBQ GRANDE FACTURADA EN $0 (factura A-017870, PVP ~$67.200) — ver nota del ítem en cocina. REPOSICIÓN DE COCTELERÍA: Tequila ML +12, Ginebra ML +4, Triple Sec +3. Se agotó el Whisky Coctelería (1→0) y el Ron DL (1→0)."
  },
  {
    date: "2026-08-05", total_estanco: 27000, total_cocteles: 287000, total: 314000, total_units: 51,
    estanco: [
      { nombre: "CERVEZA CORONA", cantidad: 4, precio_unit: 6500, total: 26000, nota: "2x1 miércoles (mitad de $13.000)" },
      { nombre: "CERVEZA NACIONAL", cantidad: 4, precio_unit: 4500, total: 18000, nota: "2x1 miércoles" },
      { nombre: "RON DL", cantidad: 1, precio_unit: 20000, total: 20000, nota: "Trago doble de ron" },
      { nombre: "RON CALDAS MEDIA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo: media botella abierta para el trago doble. SKU agotado (1→0)." },
      { nombre: "AGUA TONICA", cantidad: 4, precio_unit: 0, total: 0, nota: "Mezclador (K Gin Tonic)" },
      { nombre: "GASEOSA", cantidad: 18, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -18)" },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería (K Tequila Sunrise)" },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: -37000, nota: "🚩 Reconstrucción con 2x1 $64.000 vs estanco POS $27.000 (42,2%). Las 8 cervezas a mitad de precio ya valen $44.000, por encima del estanco POS completo. Faltan ~$37.000." },
    ],
    cocteles: [
      { nombre: "K MOJITO MIX", cantidad: 8, precio_unit: 18000, total: 144000, nota: "2x1 miércoles" },
      { nombre: "K DAIQUIRI DE FRESAS", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 miércoles" },
      { nombre: "K GIN TONIC", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 miércoles" },
      { nombre: "K SPACEBOOM", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 miércoles" },
      { nombre: "K TEQUILA SUNRISE", cantidad: 2, precio_unit: 18000, total: 36000, nota: "2x1 miércoles" },
      { nombre: "K FROZEN GRANIZADO", cantidad: 1, precio_unit: 18000, total: 18000, nota: "2x1 miércoles" },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: -19000, nota: "Reconstrucción con 2x1 $306.000 vs cócteles POS $287.000 (93,8%). Dentro del rango habitual." },
    ],
    nota: "MIÉRCOLES 5 AGO — Venta $598.600, neto $161.250 (26,9%). Coctelería sostiene el día con 17 K-cócteles ($287.000, el 48% de la venta); es el segundo día seguido con el bar activo tras el bache del fin de semana. ✅ Tirillas BIEN ALINEADAS: el BAR cruza 8/8 contra la columna Sal y la apertura del 5-ago coincide con el cierre del 4-ago en los 53 SKUs. ✅ 2x1 de miércoles confirmado: a carta completa la coctelería habría dado $612.000 contra $287.000 del POS; con 2x1 da $306.000 (93,8%). 🚩 ESTANCO AL 42,2%: reconstrucción $64.000 vs $27.000 POS. Solo las 8 cervezas a mitad de precio valen $44.000, ya por encima del estanco POS completo. Faltan ~$37.000 — monto menor pero es el cuarto día de agosto con el estanco corto. ⚠️ NÓMINA $185.000 contra una venta de $598.600 y un margen del 26,9%: el día se sostiene por poco. Reposición: Ron DL +5. Se agotó la media de Ron Caldas (1→0). NOTA: la foto de apertura del 5-ago parece mostrar WHISKY COCT en 1, pero la tirilla final del mismo día registra 0/0/0 —internamente consistente con el cierre del 4-ago, cuando se agotó—, así que se mantiene en 0."
  },
  {
    date: "2026-08-06", total_estanco: 536000, total_cocteles: 371000, total: 907000, total_units: 96,
    estanco: [
      { nombre: "CERVEZA NACIONAL", cantidad: 41, precio_unit: 9000, total: 369000, nota: "Jueves sin 2x1, PVP completo. Volumen récord de agosto." },
      { nombre: "AGT MEDIA ANQUEÑ", cantidad: 2, precio_unit: 60000, total: 120000, nota: "Repuestas y vendidas el mismo día (Ent 2 / Sal 2)" },
      { nombre: "CERVEZA CORONA", cantidad: 4, precio_unit: 13000, total: 52000 },
      { nombre: "AGUA", cantidad: 5, precio_unit: 6000, total: 30000 },
      { nombre: "GASEOSA", cantidad: 18, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -18)" },
      { nombre: "AGUA TONICA", cantidad: 1, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "CAJA DE VINO", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo Limonada de Vino" },
      { nombre: "TEQUILA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: -35000, nota: "Reconstrucción $571.000 vs estanco POS $536.000 (93,9%). Diferencia dentro del rango normal — el mejor cierre de estanco de agosto hasta ahora." },
    ],
    cocteles: [
      { nombre: "LIMONADA DE COCO", cantidad: 6, precio_unit: 12000, total: 72000 },
      { nombre: "SODA ITALIANA", cantidad: 4, precio_unit: 15000, total: 60000 },
      { nombre: "RESERVA", cantidad: 1, precio_unit: 45000, total: 45000, nota: "PVP histórico dominante del SKU" },
      { nombre: "K BLUE SKY", cantidad: 1, precio_unit: 36000, total: 36000, nota: "Jueves sin 2x1, precio completo" },
      { nombre: "LIMONADA CEREZADA", cantidad: 3, precio_unit: 12000, total: 36000 },
      { nombre: "LIMONADA DE HIERBABUENA", cantidad: 3, precio_unit: 12000, total: 36000 },
      { nombre: "JUGO EN AGUA", cantidad: 2, precio_unit: 10000, total: 20000 },
      { nombre: "JUGO MIX", cantidad: 1, precio_unit: 13000, total: 13000 },
      { nombre: "LIMONADA DE VINO", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "LIMONADA NATURAL", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: 29000, nota: "Reconstrucción $342.000 vs cócteles POS $371.000 (92,2%). El POS queda por ENCIMA, no hay faltante." },
    ],
    nota: "JUEVES 6 AGO — MEJOR DÍA DE AGOSTO ($2.107.600) Y RÉCORD HISTÓRICO DE COCINA ($1.200.600, 33 unidades, 19 productos distintos). La cocina representa el 57% de la venta del día, pero de esos $1.200.600 se van $960.480 al aliado y a La Sala solo le quedan $240.120. ✅ Tirillas BIEN ALINEADAS: verifiqué la hipótesis de desfase y NO aplica — el BAR cruza 8/8 contra la columna Sal leído en línea recta (con offset, Nacional daría 4 y Gaseosa 41, contradiciendo el inventario). Apertura del 6-ago = cierre del 5-ago exacta en los 53 SKUs. ✅ MEJOR CIERRE DE ESTANCO DE AGOSTO: $571.000 reconstruidos vs $536.000 POS (93,9%), tras cuatro días con el estanco corto. Lo impulsan 41 cervezas nacionales (volumen récord del mes) y 2 medias de aguardiente repuestas y vendidas el mismo día. ✅ Cócteles con el POS por encima de la reconstrucción (92,2%), sin faltante. ⚠️ La foto de la relación de cocina viene CORTADA: 7 productos del acumulado no aparecen en las líneas visibles. Se reconstruyeron por cruce con el acumulado y precios de catálogo; el total cuadra EXACTO en $1.200.600, y PZ HAWAIANA GR quedó derivado por diferencia en $66.000, coincidente con su histórico. Reposición: Aguardiente botella Antioqueño +1, media Antioqueño +2."
  },
  {
    date: "2026-08-07", total_estanco: 162000, total_cocteles: 24000, total: 186000, total_units: 16,
    estanco: [
      { nombre: "AGT MEDIA ANQUEÑ", cantidad: 1, precio_unit: 60000, total: 60000 },
      { nombre: "CERVEZA NACIONAL", cantidad: 3, precio_unit: 9000, total: 27000, nota: "⚠️ A PVP COMPLETO pese a ser viernes — ver nota del día" },
      { nombre: "CERVEZA CORONA", cantidad: 2, precio_unit: 13000, total: 26000, nota: "A PVP completo" },
      { nombre: "CERVEZA IMPORTADA", cantidad: 2, precio_unit: 13000, total: 26000, nota: "A PVP completo" },
      { nombre: "GASEOSA 1.5", cantidad: 1, precio_unit: 10000, total: 10000 },
      { nombre: "GASEOSA", cantidad: 5, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -5)" },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: 13000, nota: "Reconstrucción a PVP completo $149.000 vs estanco POS $162.000 (92,0%). El POS queda por ENCIMA, no hay faltante. Con 2x1 la reconstrucción daría $109.500, apenas el 67,6% — el ajuste de precio completo es el que encaja." },
    ],
    cocteles: [
      { nombre: "SODA ITALIANA", cantidad: 1, precio_unit: 15000, total: 15000 },
      { nombre: "LIMONADA NATURAL", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: -3000, nota: "Reconstrucción $27.000 vs cócteles POS $24.000 (88,9%). Solo 2 bebidas, diferencia irrelevante." },
    ],
    nota: "VIERNES 7 AGO — VIERNES ATÍPICO Y MUY FLOJO ($478.400). Es el peor viernes registrado en el archivo: el promedio de los viernes de julio fue $2.163.520, o sea que este día facturó apenas el 22% de lo normal. La coctelería prácticamente no operó ($24.000, solo 1 soda y 1 limonada, cero K-cócteles) y el estanco vendió 7 cervezas en toda la noche. ⚠️ SEGUNDA SEÑAL DE QUE EL 2x1 CAMBIÓ EN AGOSTO: la reconstrucción del estanco a PVP COMPLETO da $149.000 vs $162.000 del POS (92,0%), mientras que con 2x1 daría $109.500 (67,6%). Sumado al viernes 31-jul —donde el 2x1 corrió en cerveza pero no en cócteles— parece que la promoción de viernes se recortó o eliminó. CONFIRMAR la política vigente, porque afecta la reconstrucción de todos los viernes de agosto. La muestra es pequeña (7 cervezas), así que no es concluyente por sí sola. ✅ Tirillas BIEN ALINEADAS: el BAR cruza 6/6 contra la columna Sal; apertura del 7-ago = cierre del 6-ago exacta en los 53 SKUs. ⚠️ EFECTIVO EN $0: toda la venta entró por datáfono. Nómina de solo $38.600. Reposición: Caja de Vino +1."
  },
  {
    date: "2026-08-08", total_estanco: 973000, total_cocteles: 1017000, total: 1990000, total_units: 132,
    estanco: [
      { nombre: "TEQUILA BOTELLA", cantidad: 3, precio_unit: 195000, total: 585000, nota: "Compradas y despachadas el mismo día (Ent 4 / Sal 3). PVP carta." },
      { nombre: "CERVEZA NACIONAL", cantidad: 13, precio_unit: 9000, total: 117000, nota: "Sábado sin 2x1. De las 26 que salieron, 13 son la base de las 13 micheladas (cobradas en coctelería)." },
      { nombre: "RON CALDAS BOTELLA", cantidad: 1, precio_unit: 110000, total: 110000, nota: "SKU agotado (1→0)" },
      { nombre: "CERVEZA CORONA", cantidad: 6, precio_unit: 13000, total: 78000 },
      { nombre: "CERVEZA IMPORTADA", cantidad: 5, precio_unit: 13000, total: 65000 },
      { nombre: "ELECTROLIT", cantidad: 2, precio_unit: 8000, total: 16000 },
      { nombre: "AGUA", cantidad: 2, precio_unit: 6000, total: 12000 },
      { nombre: "CERVEZA NACIONAL (base michelada)", cantidad: 13, precio_unit: 0, total: 0, nota: "Insumo de las 13 micheladas" },
      { nombre: "WHISKY OLD PAR BOTELLA", cantidad: 1, precio_unit: 0, total: 0, nota: "🚩 SIN FACTURAR. Salió del inventario (1→0) y el estanco POS ya cierra al 99,0% sin ella. Carta $300.000, costo $136.700. Probable TRASLADO A EL BÚNKER (mismo patrón del Buchanan's el 26-jul y del aguardiente el 1-ago) — CONFIRMAR." },
      { nombre: "VINO BOTELLA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo: botella abierta para las 2 Copas de Vino (cobradas en coctelería). Repuesta y usada el mismo día (Ent 1 / Sal 1)." },
      { nombre: "GASEOSA", cantidad: 22, precio_unit: 0, total: 0, nota: "Mezclador (baja inventario -22)" },
      { nombre: "GASEOSA 1.5", cantidad: 1, precio_unit: 0, total: 0, nota: "Mezclador" },
      { nombre: "TEQUILA ML", cantidad: 2, precio_unit: 0, total: 0, nota: "Insumo coctelería (K Margarita)" },
      { nombre: "CURAZAO AZUL", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "GINEBRA ML", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "LICOR DE MANZANA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "TRIPLESEC", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo coctelería" },
      { nombre: "WHISKEY COCTELERIA", cantidad: 1, precio_unit: 0, total: 0, nota: "Insumo: base de los 4 tragos dobles de whisky. Repuesta y agotada el mismo día (Ent 1 / Sal 1)." },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: -10000, nota: "Reconstrucción $983.000 vs estanco POS $973.000 (99,0%). Cierre casi exacto — el mejor del mes." },
    ],
    cocteles: [
      { nombre: "K PECERA LA SALA", cantidad: 1, precio_unit: 95000, total: 95000 },
      { nombre: "SODA ITALIANA", cantidad: 13, precio_unit: 15000, total: 195000 },
      { nombre: "MICHELADA", cantidad: 13, precio_unit: 12000, total: 156000 },
      { nombre: "K MARGARITA", cantidad: 3, precio_unit: 36000, total: 108000, nota: "Sábado, precio completo" },
      { nombre: "TRAGO DOBLE WHISKYE", cantidad: 4, precio_unit: 20000, total: 80000 },
      { nombre: "K CUBA LIBRE", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K NUBARRON", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K ORGASMO MULTIPLE", cantidad: 2, precio_unit: 36000, total: 72000 },
      { nombre: "K PINA COLADA CON LIC", cantidad: 1, precio_unit: 47000, total: 47000 },
      { nombre: "K COSMOPOLITAN", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K LONG INSLAND", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MANGO SMOOTHIE", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K MOJITO", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K NEW THE TIME", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K SUEÑO ROSA", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "K ULA ULA", cantidad: 1, precio_unit: 36000, total: 36000 },
      { nombre: "COPA DE VINO", cantidad: 2, precio_unit: 15000, total: 30000 },
      { nombre: "LIMONADA DE COCO", cantidad: 2, precio_unit: 12000, total: 24000 },
      { nombre: "JUGO EN AGUA", cantidad: 2, precio_unit: 10000, total: 20000 },
      { nombre: "LIMONADA CEREZADA", cantidad: 1, precio_unit: 12000, total: 12000 },
      { nombre: "AJUSTE al POS", cantidad: 0, precio_unit: 0, total: -218000, nota: "🚩 Reconstrucción a carta $1.235.000 vs cócteles POS $1.017.000 (82,3%). Sábado no es día de 2x1. Mismo perfil que los sábados 18-jul (91%) y 25-jul (88%): los sábados el bar se cobra sistemáticamente por debajo de carta." },
    ],
    nota: "SÁBADO 8 AGO — MEJOR DÍA DE AGOSTO ($2.755.600) Y PRIMER FIN DE SEMANA FUERTE DEL MES. Neto $1.426.240 (51,8%). El bar aporta $1.990.000 (72% de la venta), justo lo contrario del jueves 6 donde mandó la cocina. ✅ Tirillas BIEN ALINEADAS: el BAR cruza 17/17 contra la columna Sal —el cruce más extenso registrado— y la apertura del 8-ago coincide EXACTA con el cierre del 7-ago en los 53 SKUs. ✅ ESTANCO AL 99,0%: $983.000 reconstruidos vs $973.000 POS, el mejor cierre del mes. Lo impulsan 3 botellas de tequila (Ent 4/Sal 3) y 1 Ron Caldas botella. 🚩 CÓCTELES AL 82,3%: faltan ~$218.000. Es el mismo patrón de todos los sábados (18-jul 91%, 25-jul 88%) — los sábados el bar se cobra por debajo de carta de forma sistemática. 🚩 1 BOTELLA DE OLD PARR salió sin facturar (carta $300.000, costo $136.700); probable traslado a El Búnker, confirmar. 🚩 SEGUNDA PIZZA EN $0 DEL MES (PZ Margarita Med, factura A-017940). GRAN REPOSICIÓN: Corona +24, Nacional +12, Gaseosa +24, Agua Tónica +6, Tequila botella +4, Aguardiente botella Antioqueño +2 y media +1, Vino Botella +1, Whisky Coctelería +1. ⚠️ GASTOS $436.580, los más altos de agosto — pedir el detalle."
  }
];

const PRELOADED_INVENTARIOS = [
  {
    date: "2026-04-01", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:7},
      {nombre:"AGT BOTLLA CAUCA",saldo:1},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:2},
      {nombre:"AGT MEDIA CAUCA",saldo:3},
      {nombre:"AGUA",saldo:21},
      {nombre:"AGUA TONICA",saldo:3},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:0},
      {nombre:"CERVEZA IMPORTADA",saldo:28},
      {nombre:"CERVEZA NACIONAL",saldo:156},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:2},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:6},
      {nombre:"GASEOSA",saldo:113},
      {nombre:"GASEOSA 1.5",saldo:14},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:5},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:15},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:2},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:5},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-04-02", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:6},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:2},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:20},
      {nombre:"AGUA TONICA",saldo:2},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:0},
      {nombre:"CERVEZA CORONA",saldo:0},
      {nombre:"CERVEZA IMPORTADA",saldo:26},
      {nombre:"CERVEZA NACIONAL",saldo:127},
      {nombre:"CHICLETS",saldo:8},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:89},
      {nombre:"GASEOSA 1.5",saldo:19},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:4},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:2},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:3},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:2},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-04-03", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:6},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:1},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:15},
      {nombre:"AGUA TONICA",saldo:0},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:0},
      {nombre:"CERVEZA CORONA",saldo:16},
      {nombre:"CERVEZA IMPORTADA",saldo:31},
      {nombre:"CERVEZA NACIONAL",saldo:149},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:84},
      {nombre:"GASEOSA 1.5",saldo:18},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:1},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:2},
      {nombre:"RON CALDAS BOTELLA",saldo:2},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:6},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:2},
      {nombre:"TRIPLESEC",saldo:1},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:7},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-04-04", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:5},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:1},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:36},
      {nombre:"AGUA TONICA",saldo:8},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:7},
      {nombre:"CERVEZA CORONA",saldo:21},
      {nombre:"CERVEZA IMPORTADA",saldo:25},
      {nombre:"CERVEZA NACIONAL",saldo:188},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:4},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:135},
      {nombre:"GASEOSA 1.5",saldo:18},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:2},
      {nombre:"RON CALDAS BOTELLA",saldo:2},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:6},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:1},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:6},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:7},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-04-05", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:5},
      {nombre:"AGT BOTLLA CAUCA",saldo:2},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:1},
      {nombre:"AGT MEDIA CAUCA",saldo:7},
      {nombre:"AGUA",saldo:18},
      {nombre:"AGUA TONICA",saldo:3},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:19},
      {nombre:"CERVEZA IMPORTADA",saldo:33},
      {nombre:"CERVEZA NACIONAL",saldo:138},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:2},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:106},
      {nombre:"GASEOSA 1.5",saldo:10},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:0},
      {nombre:"LICOR CAFÉ",saldo:2},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:2},
      {nombre:"RON CALDAS BOTELLA",saldo:2},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:6},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:1},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:7},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-04-15", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:5},
      {nombre:"AGT BOTLLA CAUCA",saldo:2},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:1},
      {nombre:"AGT MEDIA CAUCA",saldo:7},
      {nombre:"AGUA",saldo:18},
      {nombre:"AGUA TONICA",saldo:5},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:23},
      {nombre:"CERVEZA IMPORTADA",saldo:23},
      {nombre:"CERVEZA NACIONAL",saldo:126},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:88},
      {nombre:"GASEOSA 1.5",saldo:10},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:10},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:2},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:6},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:1},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:7},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:0}
    ]
  },
  {
    date: "2026-04-18", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:6},
      {nombre:"AGT BOTLLA CAUCA",saldo:3},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:2},
      {nombre:"AGT MEDIA CAUCA",saldo:7},
      {nombre:"AGUA",saldo:24},
      {nombre:"AGUA TONICA",saldo:5},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:18},
      {nombre:"CERVEZA IMPORTADA",saldo:15},
      {nombre:"CERVEZA NACIONAL",saldo:93},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:2},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:92},
      {nombre:"GASEOSA 1.5",saldo:8},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:9},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:7},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-04-19", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:6},
      {nombre:"AGT BOTLLA CAUCA",saldo:3},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:2},
      {nombre:"AGT MEDIA CAUCA",saldo:7},
      {nombre:"AGUA",saldo:24},
      {nombre:"AGUA TONICA",saldo:5},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:18},
      {nombre:"CERVEZA IMPORTADA",saldo:15},
      {nombre:"CERVEZA NACIONAL",saldo:91},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:2},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:89},
      {nombre:"GASEOSA 1.5",saldo:8},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:9},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:1},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:7},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-04-20", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:6},
      {nombre:"AGT BOTLLA CAUCA",saldo:3},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:2},
      {nombre:"AGT MEDIA CAUCA",saldo:7},
      {nombre:"AGUA",saldo:24},
      {nombre:"AGUA TONICA",saldo:5},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:18},
      {nombre:"CERVEZA IMPORTADA",saldo:15},
      {nombre:"CERVEZA NACIONAL",saldo:89},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:2},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:86},
      {nombre:"GASEOSA 1.5",saldo:8},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:9},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:1},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:7},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-04-21", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:6},
      {nombre:"AGT BOTLLA CAUCA",saldo:3},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:2},
      {nombre:"AGT MEDIA CAUCA",saldo:7},
      {nombre:"AGUA",saldo:24},
      {nombre:"AGUA TONICA",saldo:5},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:18},
      {nombre:"CERVEZA IMPORTADA",saldo:15},
      {nombre:"CERVEZA NACIONAL",saldo:84},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:2},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:79},
      {nombre:"GASEOSA 1.5",saldo:8},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:5},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:13},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:7},
      {nombre:"TRIPLESEC",saldo:4},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:7},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-04-23", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:6},
      {nombre:"AGT BOTLLA CAUCA",saldo:3},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:2},
      {nombre:"AGT MEDIA CAUCA",saldo:7},
      {nombre:"AGUA",saldo:23},
      {nombre:"AGUA TONICA",saldo:5},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:16},
      {nombre:"CERVEZA IMPORTADA",saldo:15},
      {nombre:"CERVEZA NACIONAL",saldo:75},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:2},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:75},
      {nombre:"GASEOSA 1.5",saldo:7},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:4},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:4},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:6},
      {nombre:"TRIPLESEC",saldo:4},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-04-24", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:8},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:2},
      {nombre:"AGT MEDIA CAUCA",saldo:7},
      {nombre:"AGUA",saldo:23},
      {nombre:"AGUA TONICA",saldo:8},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:4},
      {nombre:"CERVEZA CORONA",saldo:46},
      {nombre:"CERVEZA IMPORTADA",saldo:38},
      {nombre:"CERVEZA NACIONAL",saldo:156},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:2},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:144},
      {nombre:"GASEOSA 1.5",saldo:7},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:4},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:4},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:1},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:6},
      {nombre:"TRIPLESEC",saldo:4},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-04-25", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:6},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:2},
      {nombre:"AGT MEDIA CAUCA",saldo:7},
      {nombre:"AGUA",saldo:23},
      {nombre:"AGUA TONICA",saldo:8},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:4},
      {nombre:"CERVEZA CORONA",saldo:40},
      {nombre:"CERVEZA IMPORTADA",saldo:38},
      {nombre:"CERVEZA NACIONAL",saldo:125},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:2},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:136},
      {nombre:"GASEOSA 1.5",saldo:8},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:4},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:4},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-04-26", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:6},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:2},
      {nombre:"AGT MEDIA CAUCA",saldo:7},
      {nombre:"AGUA",saldo:22},
      {nombre:"AGUA TONICA",saldo:8},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:4},
      {nombre:"CERVEZA CORONA",saldo:40},
      {nombre:"CERVEZA IMPORTADA",saldo:38},
      {nombre:"CERVEZA NACIONAL",saldo:118},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:2},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:133},
      {nombre:"GASEOSA 1.5",saldo:8},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:4},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:4},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-04-27", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:6},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:2},
      {nombre:"AGT MEDIA CAUCA",saldo:7},
      {nombre:"AGUA",saldo:22},
      {nombre:"AGUA TONICA",saldo:8},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:3},
      {nombre:"CERVEZA CORONA",saldo:40},
      {nombre:"CERVEZA IMPORTADA",saldo:38},
      {nombre:"CERVEZA NACIONAL",saldo:118},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:2},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:129},
      {nombre:"GASEOSA 1.5",saldo:8},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:4},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:4},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:6},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-04-28", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:4},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:2},
      {nombre:"AGT MEDIA CAUCA",saldo:7},
      {nombre:"AGUA",saldo:22},
      {nombre:"AGUA TONICA",saldo:8},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:3},
      {nombre:"CERVEZA CORONA",saldo:42},
      {nombre:"CERVEZA IMPORTADA",saldo:38},
      {nombre:"CERVEZA NACIONAL",saldo:115},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:2},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:128},
      {nombre:"GASEOSA 1.5",saldo:7},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:4},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:4},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:6},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-04-29", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:4},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:2},
      {nombre:"AGT MEDIA CAUCA",saldo:7},
      {nombre:"AGUA",saldo:46},
      {nombre:"AGUA TONICA",saldo:8},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:3},
      {nombre:"CERVEZA CORONA",saldo:41},
      {nombre:"CERVEZA IMPORTADA",saldo:38},
      {nombre:"CERVEZA NACIONAL",saldo:112},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:172},
      {nombre:"GASEOSA 1.5",saldo:7},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:4},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:5},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-04-30", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:4},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:-1},
      {nombre:"AGT MEDIA CAUCA",saldo:9},
      {nombre:"AGUA",saldo:46},
      {nombre:"AGUA TONICA",saldo:7},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:3},
      {nombre:"CERVEZA CORONA",saldo:33},
      {nombre:"CERVEZA IMPORTADA",saldo:32},
      {nombre:"CERVEZA NACIONAL",saldo:91},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:150},
      {nombre:"GASEOSA 1.5",saldo:18},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:2},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:4},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-05-01", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:7},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:2},
      {nombre:"AGT MEDIA CAUCA",saldo:8},
      {nombre:"AGUA",saldo:37},
      {nombre:"AGUA TONICA",saldo:7},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:57},
      {nombre:"CERVEZA IMPORTADA",saldo:54},
      {nombre:"CERVEZA NACIONAL",saldo:197},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:131},
      {nombre:"GASEOSA 1.5",saldo:18},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-05-02", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:7},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:1},
      {nombre:"AGT MEDIA CAUCA",saldo:8},
      {nombre:"AGUA",saldo:36},
      {nombre:"AGUA TONICA",saldo:7},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:39},
      {nombre:"CERVEZA IMPORTADA",saldo:51},
      {nombre:"CERVEZA NACIONAL",saldo:177},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:123},
      {nombre:"GASEOSA 1.5",saldo:18},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-05-03", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:7},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:1},
      {nombre:"AGT MEDIA CAUCA",saldo:8},
      {nombre:"AGUA",saldo:36},
      {nombre:"AGUA TONICA",saldo:7},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:39},
      {nombre:"CERVEZA IMPORTADA",saldo:51},
      {nombre:"CERVEZA NACIONAL",saldo:177},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:121},
      {nombre:"GASEOSA 1.5",saldo:18},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:2},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-05-04", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:7},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:1},
      {nombre:"AGT MEDIA CAUCA",saldo:8},
      {nombre:"AGUA",saldo:36},
      {nombre:"AGUA TONICA",saldo:7},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:39},
      {nombre:"CERVEZA IMPORTADA",saldo:51},
      {nombre:"CERVEZA NACIONAL",saldo:165},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:115},
      {nombre:"GASEOSA 1.5",saldo:18},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:0},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:-1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:2},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:1},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:2},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:0},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:6},
      {nombre:"VODKA DL",saldo:0},
      {nombre:"BUCHANAN'S BOTELLA",saldo:2},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-05-05", tipo: "final",
    // Saldos actualizados según conteo físico hecho el miércoles 6
    // (correcciones de Buchanan's, Vodkas, Vino Botella, Tequilas, Ron DL, Triple Sec, Whisky Coct)
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:7},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:1},
      {nombre:"AGT MEDIA CAUCA",saldo:8},
      {nombre:"AGUA",saldo:36},
      {nombre:"AGUA TONICA",saldo:7},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:39},
      {nombre:"CERVEZA IMPORTADA",saldo:51},
      {nombre:"CERVEZA NACIONAL",saldo:165},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:115},
      {nombre:"GASEOSA 1.5",saldo:18},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:0},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:-1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:2},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-05-06", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:7},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:1},
      {nombre:"AGT MEDIA CAUCA",saldo:8},
      {nombre:"AGUA",saldo:36},
      {nombre:"AGUA TONICA",saldo:6},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:34},
      {nombre:"CERVEZA IMPORTADA",saldo:48},
      {nombre:"CERVEZA NACIONAL",saldo:163},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:105},
      {nombre:"GASEOSA 1.5",saldo:17},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:5},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:16},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:6},
      {nombre:"TRIPLESEC",saldo:5},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-05-07", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:7},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:1},
      {nombre:"AGT MEDIA CAUCA",saldo:8},
      {nombre:"AGUA",saldo:36},
      {nombre:"AGUA TONICA",saldo:6},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:33},
      {nombre:"CERVEZA IMPORTADA",saldo:46},
      {nombre:"CERVEZA NACIONAL",saldo:150},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:100},
      {nombre:"GASEOSA 1.5",saldo:17},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:5},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:16},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:6},
      {nombre:"TRIPLESEC",saldo:5},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-05-08", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:6},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:6},
      {nombre:"AGT MEDIA CAUCA",saldo:8},
      {nombre:"AGUA",saldo:35},
      {nombre:"AGUA TONICA",saldo:3},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:29},
      {nombre:"CERVEZA IMPORTADA",saldo:44},
      {nombre:"CERVEZA NACIONAL",saldo:138},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:130},
      {nombre:"GASEOSA 1.5",saldo:17},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:4},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:15},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:2},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:3},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:1},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:4},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-05-09", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:13},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:8},
      {nombre:"AGT MEDIA CAUCA",saldo:8},
      {nombre:"AGUA",saldo:32},
      {nombre:"AGUA TONICA",saldo:6},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:15},
      {nombre:"CERVEZA IMPORTADA",saldo:43},
      {nombre:"CERVEZA NACIONAL",saldo:101},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:1},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:176},
      {nombre:"GASEOSA 1.5",saldo:27},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:14},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:3},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:1},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:4},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-05-10", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:13},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:8},
      {nombre:"AGT MEDIA CAUCA",saldo:7},
      {nombre:"AGUA",saldo:31},
      {nombre:"AGUA TONICA",saldo:6},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:15},
      {nombre:"CERVEZA IMPORTADA",saldo:43},
      {nombre:"CERVEZA NACIONAL",saldo:87},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:1},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:172},
      {nombre:"GASEOSA 1.5",saldo:26},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:3},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:1},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-05-11", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:13},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:8},
      {nombre:"AGT MEDIA CAUCA",saldo:8},
      {nombre:"AGUA",saldo:31},
      {nombre:"AGUA TONICA",saldo:6},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:15},
      {nombre:"CERVEZA IMPORTADA",saldo:40},
      {nombre:"CERVEZA NACIONAL",saldo:85},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:169},
      {nombre:"GASEOSA 1.5",saldo:26},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:3},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:4},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-05-12", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:13},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:8},
      {nombre:"AGT MEDIA CAUCA",saldo:8},
      {nombre:"AGUA",saldo:30},
      {nombre:"AGUA TONICA",saldo:4},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:7},
      {nombre:"CERVEZA IMPORTADA",saldo:40},
      {nombre:"CERVEZA NACIONAL",saldo:78},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:1},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:164},
      {nombre:"GASEOSA 1.5",saldo:26},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:1},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-05-13", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:13},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:8},
      {nombre:"AGT MEDIA CAUCA",saldo:8},
      {nombre:"AGUA",saldo:29},
      {nombre:"AGUA TONICA",saldo:4},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:7},
      {nombre:"CERVEZA IMPORTADA",saldo:40},
      {nombre:"CERVEZA NACIONAL",saldo:76},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:1},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:159},
      {nombre:"GASEOSA 1.5",saldo:26},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:5},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:6},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:8},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:0}
    ]
  },
  {
    date: "2026-05-14", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:13},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:26},
      {nombre:"AGUA TONICA",saldo:4},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:6},
      {nombre:"CERVEZA IMPORTADA",saldo:39},
      {nombre:"CERVEZA NACIONAL",saldo:67},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:1},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:154},
      {nombre:"GASEOSA 1.5",saldo:26},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:5},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:6},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:8},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:2},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:0}
    ]
  },
  {
    date: "2026-05-15", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:11},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:8},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:23},
      {nombre:"AGUA TONICA",saldo:3},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:10},
      {nombre:"CERVEZA IMPORTADA",saldo:37},
      {nombre:"CERVEZA NACIONAL",saldo:70},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:2},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:1},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:135},
      {nombre:"GASEOSA 1.5",saldo:26},
      {nombre:"GINEBRA BOTELLA",saldo:1},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:4},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:7},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-05-16", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:11},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:22},
      {nombre:"AGUA TONICA",saldo:2},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:22},
      {nombre:"CERVEZA IMPORTADA",saldo:44},
      {nombre:"CERVEZA NACIONAL",saldo:198},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:2},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:4},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:143},
      {nombre:"GASEOSA 1.5",saldo:24},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:4},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:4},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:7},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:0},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-05-17", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:11},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:18},
      {nombre:"AGUA TONICA",saldo:1},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:22},
      {nombre:"CERVEZA IMPORTADA",saldo:44},
      {nombre:"CERVEZA NACIONAL",saldo:182},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:2},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:4},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:135},
      {nombre:"GASEOSA 1.5",saldo:24},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:3},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:6},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-05-18", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:11},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:18},
      {nombre:"AGUA TONICA",saldo:1},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:21},
      {nombre:"CERVEZA IMPORTADA",saldo:41},
      {nombre:"CERVEZA NACIONAL",saldo:171},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:2},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:4},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:133},
      {nombre:"GASEOSA 1.5",saldo:25},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:3},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:6},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-05-19", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:11},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:18},
      {nombre:"AGUA TONICA",saldo:1},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:21},
      {nombre:"CERVEZA IMPORTADA",saldo:41},
      {nombre:"CERVEZA NACIONAL",saldo:171},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:2},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:4},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:131},
      {nombre:"GASEOSA 1.5",saldo:25},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:1},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:5},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:2},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-05-20", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:11},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:12},
      {nombre:"AGUA TONICA",saldo:1},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:21},
      {nombre:"CERVEZA IMPORTADA",saldo:34},
      {nombre:"CERVEZA NACIONAL",saldo:171},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:2},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:4},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:126},
      {nombre:"GASEOSA 1.5",saldo:25},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:1},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:4},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:2},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-05-21", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:11},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:8},
      {nombre:"AGT MEDIA CAUCA",saldo:3},
      {nombre:"AGUA",saldo:36},
      {nombre:"AGUA TONICA",saldo:13},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:21},
      {nombre:"CERVEZA IMPORTADA",saldo:33},
      {nombre:"CERVEZA NACIONAL",saldo:155},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:1},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:4},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:191},
      {nombre:"GASEOSA 1.5",saldo:25},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:4},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:4},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:2},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-05-22", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:11},
      {nombre:"AGT BOTLLA CAUCA",saldo:1},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:3},
      {nombre:"AGUA",saldo:31},
      {nombre:"AGUA TONICA",saldo:13},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:20},
      {nombre:"CERVEZA IMPORTADA",saldo:24},
      {nombre:"CERVEZA NACIONAL",saldo:115},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:1},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:3},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:137},
      {nombre:"GASEOSA 1.5",saldo:22},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:10},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:3},
      {nombre:"RON DL",saldo:3},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:0},
      {nombre:"TEQUILA ML",saldo:4},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:0},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:2},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:0}
    ]
  },
  {
    date: "2026-05-23", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:11},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:29},
      {nombre:"AGUA TONICA",saldo:13},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:19},
      {nombre:"CERVEZA IMPORTADA",saldo:19},
      {nombre:"CERVEZA NACIONAL",saldo:143},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:3},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:147},
      {nombre:"GASEOSA 1.5",saldo:34},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:5},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:14},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:2},
      {nombre:"RON CALDAS MEDIA",saldo:3},
      {nombre:"RON DL",saldo:1},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:0},
      {nombre:"TEQUILA ML",saldo:5},
      {nombre:"TRIPLESEC",saldo:5},
      {nombre:"VINO BOTELLA",saldo:0},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:2},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:0}
    ]
  },
  {
    date: "2026-05-24", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:11},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:29},
      {nombre:"AGUA TONICA",saldo:13},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:19},
      {nombre:"CERVEZA IMPORTADA",saldo:19},
      {nombre:"CERVEZA NACIONAL",saldo:136},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:3},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:143},
      {nombre:"GASEOSA 1.5",saldo:33},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:5},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:14},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:2},
      {nombre:"RON CALDAS MEDIA",saldo:3},
      {nombre:"RON DL",saldo:1},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:0},
      {nombre:"TEQUILA ML",saldo:5},
      {nombre:"TRIPLESEC",saldo:5},
      {nombre:"VINO BOTELLA",saldo:0},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:2},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:0}
    ]
  },
  {
    // Reconstruido desde foto FINAL lunes 25 may (autoritativo) + foto INICIAL martes 26 may (confirmación cruzada).
    // Movimientos lunes 25:
    //   CAJA DE VINO: Sal=1 → 1 (consumo bar 25)
    //   CERVEZA NACIONAL: Ent=2, Sal=5 → 131 (5 vendidas estanco bar 25; 2 reposición interna)
    //   GASEOSA: Sal=4 → 139 (4 mezcladores, no cobradas)
    //   RON DL: Ent=5 → 6 (reposición interna no registrada en compras del día)
    //   VODKA DL: Ent=5 → 7 (reposición interna no registrada)
    //   TRIPLE SEC: sin movimiento → sigue en 5 (NO se usaron en cócteles 25)
    //   CIGARRILLOS: sin movimiento → sigue en 0
    date: "2026-05-25", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:11},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:29},
      {nombre:"AGUA TONICA",saldo:13},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:19},
      {nombre:"CERVEZA IMPORTADA",saldo:19},
      {nombre:"CERVEZA NACIONAL",saldo:131},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:3},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:139},
      {nombre:"GASEOSA 1.5",saldo:33},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:5},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:14},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:2},
      {nombre:"RON CALDAS MEDIA",saldo:3},
      {nombre:"RON DL",saldo:6},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:0},
      {nombre:"TEQUILA ML",saldo:5},
      {nombre:"TRIPLESEC",saldo:5},
      {nombre:"VINO BOTELLA",saldo:0},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:7},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:0}
    ]
  },
  {
    // Foto FINAL martes 26 may (validada contra foto INICIAL 26 = FINAL 25).
    // Salidas únicas el martes 26 (Sal columna foto):
    //   AGUA: Sal=1 → 28
    //   CERVEZA NACIONAL: Sal=2 → 129
    //   GASEOSA: Sal=4 → 135
    //   VINO BOTELLA: Sal=1 → -1 (vendieron 1 sin stock - faltante a reponer)
    // TODO LO DEMÁS sin movimiento (TRIPLE SEC=5, CIGARRILLOS=0, VODKA DL=7, etc.)
    // Cuadra con reporte BAR: 1 AGUA, 2 CERV NAC, 4 GASEOSA, 1 VINO BOT, 4 K MOJITO MIX, 2 LIMONADA NAT.
    // (Mojitos no usan Triple Sec; usan menta+limón+ron+soda+azúcar)
    date: "2026-05-26", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:11},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:28},
      {nombre:"AGUA TONICA",saldo:13},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:19},
      {nombre:"CERVEZA IMPORTADA",saldo:19},
      {nombre:"CERVEZA NACIONAL",saldo:129},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:3},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:135},
      {nombre:"GASEOSA 1.5",saldo:33},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:5},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:14},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:2},
      {nombre:"RON CALDAS MEDIA",saldo:3},
      {nombre:"RON DL",saldo:6},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:0},
      {nombre:"TEQUILA ML",saldo:5},
      {nombre:"TRIPLESEC",saldo:5},
      {nombre:"VINO BOTELLA",saldo:-1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:7},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:0}
    ]
  },
  {
    // Foto FINAL miércoles 27 may. Movimientos:
    //   ENTRADAS (compras del día por transferencia):
    //     CERVEZA CORONA: Ent=24 → 43 (KOPPS 4 sixpacks Corona)
    //     CERVEZA IMPORTADA: Ent=32 → 51 (KOPPS Stella + otros)
    //     CERVEZA NACIONAL: Ent=90 → 219 (KOPPS 2 cajas Club x30 + Coronita x30)
    //     GASEOSA: Ent=60 → (Postobón Bretaña 60und); Sal=4 (mezclador/venta) → 191 en foto cierre.
    //              CORREGIDO a 193: la foto inicial 28 (autoritativa) muestra 193 (reconteo/reposición madrugada +2).
    //     VINO BOTELLA: Ent=1 → 0 (repuesta la botella faltante del martes)
    //   SALIDAS:
    //     GINEBRA ML: Sal=1 → 4 (trago estanco)
    //     TEQUILA ML: Sal=1 → 4 (trago)
    //     GASEOSA: Sal=4 (incluido arriba)
    //   Cócteles (Daiquiri, Margarita, Martini Dry, Tequila Sunrise) servidos de botellas abiertas (no descuentan unidad base).
    date: "2026-05-27", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:11},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:28},
      {nombre:"AGUA TONICA",saldo:13},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:43},
      {nombre:"CERVEZA IMPORTADA",saldo:51},
      {nombre:"CERVEZA NACIONAL",saldo:219},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:3},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:193},
      {nombre:"GASEOSA 1.5",saldo:33},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:4},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:14},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:2},
      {nombre:"RON CALDAS MEDIA",saldo:3},
      {nombre:"RON DL",saldo:6},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:0},
      {nombre:"TEQUILA ML",saldo:4},
      {nombre:"TRIPLESEC",saldo:5},
      {nombre:"VINO BOTELLA",saldo:0},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:7},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:0}
    ]
  },
  {
    // Foto FINAL jueves 28 may. Inicial 28 = Final 27 (con corrección GASEOSA 191→193 por reconteo madrugada).
    // Movimientos jueves 28:
    //   GASEOSA: Ent=42, Sal=6 → 229 (193+42-6). Reposición + ventas/mezclador.
    //   AGUA: Sal=2 → 26
    //   CERVEZA NACIONAL: Sal=4 → 215
    //   LICOR DE MANZANA: Sal=1 → 13 (cóctel)
    //   RON DL: Sal=2 → 4 (2 cócteles con ron / tragos)
    //   TRIPLE SEC: Sal=1 → 4 (1 cóctel: Margarita usa triple sec)
    //   WHISKY COCT: Sal=1 → (coctelería con whisky)
    //   Cócteles servidos de botellas abiertas no descuentan unidad base.
    date: "2026-05-28", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:11},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:26},
      {nombre:"AGUA TONICA",saldo:13},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:43},
      {nombre:"CERVEZA IMPORTADA",saldo:51},
      {nombre:"CERVEZA NACIONAL",saldo:215},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:3},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:229},
      {nombre:"GASEOSA 1.5",saldo:33},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:4},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:13},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:2},
      {nombre:"RON CALDAS MEDIA",saldo:3},
      {nombre:"RON DL",saldo:4},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:0},
      {nombre:"TEQUILA ML",saldo:4},
      {nombre:"TRIPLESEC",saldo:4},
      {nombre:"VINO BOTELLA",saldo:0},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:7},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:0}
    ]
  },
  {
    // Foto FINAL viernes 29 may. ATENCIÓN: la foto tiene DESFASE TIPOGRÁFICO de -1 línea
    // (los valores Ent/Sal/Saldo aparecen una línea por debajo de su producto).
    // Validado con inicial+Ent-Sal=Saldo y anclado contra reporte BAR (AGUA-5, GASEOSA-27, CERV NAC-56).
    // Movimientos viernes 29 (día fuerte, $4.858.000 venta):
    //   AGT BOTLLA CAUCA: Ent=1 Sal=2 → 4
    //   AGT MEDIA CAUCA: Ent=2 Sal=1 → 3
    //   AGUA: Sal=5 → 21 ; AGUA TONICA: Sal=1 → 12 ; AMARETO: sin mov → 1
    //   CAJA DE VINO: Sal=1 → 0 (6 copas servidas de 1 caja física)
    //   CERVEZA CORONA: Sal=16 → 27
    //   CERVEZA IMPORTADA: Sal=16 → 35
    //   CERVEZA NACIONAL: Sal=56 → 159 (incluye 31 micheladas + cervezas directas)
    //   ELECTROLIT: Sal=1 → 2
    //   GASEOSA: Sal=27 → 202
    //   GINEBRA ML: Sal=2 → 2 ; LICOR MANZANA: Sal=1 → 12
    //   RON CALDAS BOT: Sal=1 → 1 ; RON CALDAS MED: Sal=1 → 2 ; RON DL: Sal=4 → 0
    //   TEQUILA MEDIA: Ent=2 → 2 ; TEQUILA ML: Sal=3 → 1
    //   VINO BOTELLA: Ent=3 → 3 (reposición) ; VODKA DL: Sal=1 → 6
    //   WHISKY COCT: Ent=1 Sal=1 → 0 ; OLD PARR MEDIA: Ent=1 → 1
    date: "2026-05-29", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:11},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:3},
      {nombre:"AGUA",saldo:21},
      {nombre:"AGUA TONICA",saldo:12},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:27},
      {nombre:"CERVEZA IMPORTADA",saldo:35},
      {nombre:"CERVEZA NACIONAL",saldo:159},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:202},
      {nombre:"GASEOSA 1.5",saldo:33},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:4},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    // Foto FINAL sábado 30 may (bien alineada, sin desfase). Inicial 30 = final 29 (corregido CAJA DE VINO 0→1).
    // Movimientos sábado 30 (día fuerte $1.221.200):
    //   AGTE BOTELLA CAUCANO: Sal=4 → 0 (4 botellas vendidas estanco = $360k)
    //   AGUA: Sal=2 → 19
    //   CAJA DE VINO: Sal=2 → -1 (2 cajas para 12 copas sangría + 1 jarra; quedó -1 a reponer)
    //   CERVEZA NACIONAL: Sal=3 → 156
    //   GASEOSA: Sal=12 → 190 (2 venta directa + 10 mezcladores)
    //   LICOR DE MANZANA: Sal=1 → 11 (cócteles)
    //   RON DL: Ent=5 → 5 (reposición; estaba en 0)
    //   TEQUILA ML: Sal=1 → 0 ; TRIPLE SEC: Sal=1 → 3 (insumo cóctel) ; VINO BOTELLA: Sal=1 → 2 (insumo sangría)
    date: "2026-05-30", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:11},
      {nombre:"AGT BOTLLA CAUCA",saldo:0},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:3},
      {nombre:"AGUA",saldo:19},
      {nombre:"AGUA TONICA",saldo:12},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:-1},
      {nombre:"CERVEZA CORONA",saldo:27},
      {nombre:"CERVEZA IMPORTADA",saldo:35},
      {nombre:"CERVEZA NACIONAL",saldo:156},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:190},
      {nombre:"GASEOSA 1.5",saldo:33},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:0},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-01", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:11},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:5},
      {nombre:"AGT MEDIA CAUCA",saldo:3},
      {nombre:"AGUA",saldo:17},
      {nombre:"AGUA TONICA",saldo:12},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:27},
      {nombre:"CERVEZA IMPORTADA",saldo:33},
      {nombre:"CERVEZA NACIONAL",saldo:138},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:173},
      {nombre:"GASEOSA 1.5",saldo:32},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:0},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-02", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:11},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:5},
      {nombre:"AGT MEDIA CAUCA",saldo:3},
      {nombre:"AGUA",saldo:16},
      {nombre:"AGUA TONICA",saldo:12},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:27},
      {nombre:"CERVEZA IMPORTADA",saldo:33},
      {nombre:"CERVEZA NACIONAL",saldo:133},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:171},
      {nombre:"GASEOSA 1.5",saldo:32},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:5},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:15},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:6},
      {nombre:"TRIPLESEC",saldo:5},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-03", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:17},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:3},
      {nombre:"AGUA",saldo:15},
      {nombre:"AGUA TONICA",saldo:12},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:11},
      {nombre:"CERVEZA IMPORTADA",saldo:23},
      {nombre:"CERVEZA NACIONAL",saldo:114},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:166},
      {nombre:"GASEOSA 1.5",saldo:32},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:4},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:15},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:5},
      {nombre:"TRIPLESEC",saldo:5},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-04", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:23},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:9},
      {nombre:"AGT MEDIA CAUCA",saldo:3},
      {nombre:"AGUA",saldo:38},
      {nombre:"AGUA TONICA",saldo:12},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:8},
      {nombre:"CERVEZA IMPORTADA",saldo:23},
      {nombre:"CERVEZA NACIONAL",saldo:101},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:206},
      {nombre:"GASEOSA 1.5",saldo:32},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:4},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:15},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:5},
      {nombre:"TRIPLESEC",saldo:5},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-05", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:18},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:9},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:35},
      {nombre:"AGUA TONICA",saldo:7},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:25},
      {nombre:"CERVEZA IMPORTADA",saldo:20},
      {nombre:"CERVEZA NACIONAL",saldo:130},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:177},
      {nombre:"GASEOSA 1.5",saldo:31},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:14},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:4},
      {nombre:"TRIPLESEC",saldo:5},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-06", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:18},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:8},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:34},
      {nombre:"AGUA TONICA",saldo:7},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:40},
      {nombre:"CERVEZA IMPORTADA",saldo:24},
      {nombre:"CERVEZA NACIONAL",saldo:264},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:160},
      {nombre:"GASEOSA 1.5",saldo:30},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:13},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:2},
      {nombre:"TRIPLESEC",saldo:4},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-07", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:18},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:8},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:33},
      {nombre:"AGUA TONICA",saldo:7},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:32},
      {nombre:"CERVEZA IMPORTADA",saldo:22},
      {nombre:"CERVEZA NACIONAL",saldo:224},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:148},
      {nombre:"GASEOSA 1.5",saldo:30},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:13},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:4},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-08", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:18},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:8},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:32},
      {nombre:"AGUA TONICA",saldo:4},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:32},
      {nombre:"CERVEZA IMPORTADA",saldo:21},
      {nombre:"CERVEZA NACIONAL",saldo:224},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:142},
      {nombre:"GASEOSA 1.5",saldo:30},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:4},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-09", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:18},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:8},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:32},
      {nombre:"AGUA TONICA",saldo:4},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:32},
      {nombre:"CERVEZA IMPORTADA",saldo:21},
      {nombre:"CERVEZA NACIONAL",saldo:221},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:137},
      {nombre:"GASEOSA 1.5",saldo:30},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:4},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:6},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:6},
      {nombre:"TRIPLESEC",saldo:4},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-10", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:16},
      {nombre:"AGT BOTLLA CAUCA",saldo:3},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:8},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:30},
      {nombre:"AGUA TONICA",saldo:2},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:22},
      {nombre:"CERVEZA IMPORTADA",saldo:21},
      {nombre:"CERVEZA NACIONAL",saldo:217},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:127},
      {nombre:"GASEOSA 1.5",saldo:30},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:6},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:3},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-11", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:16},
      {nombre:"AGT BOTLLA CAUCA",saldo:3},
      {nombre:"AGT BOTLLA REAL",saldo:1},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:8},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:28},
      {nombre:"AGUA TONICA",saldo:2},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:18},
      {nombre:"CERVEZA IMPORTADA",saldo:21},
      {nombre:"CERVEZA NACIONAL",saldo:213},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:123},
      {nombre:"GASEOSA 1.5",saldo:30},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:6},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:3},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-12", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:16},
      {nombre:"AGT BOTLLA CAUCA",saldo:3},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:8},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:26},
      {nombre:"AGUA TONICA",saldo:1},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:13},
      {nombre:"CERVEZA IMPORTADA",saldo:21},
      {nombre:"CERVEZA NACIONAL",saldo:203},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:0},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:111},
      {nombre:"GASEOSA 1.5",saldo:28},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:6},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:3},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-13", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:16},
      {nombre:"AGT BOTLLA CAUCA",saldo:3},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:8},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:26},
      {nombre:"AGUA TONICA",saldo:1},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:25},
      {nombre:"CERVEZA IMPORTADA",saldo:20},
      {nombre:"CERVEZA NACIONAL",saldo:200},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:122},
      {nombre:"GASEOSA 1.5",saldo:26},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:6},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:3},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:4},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-14", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:16},
      {nombre:"AGT BOTLLA CAUCA",saldo:2},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:24},
      {nombre:"AGUA TONICA",saldo:-2},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:17},
      {nombre:"CERVEZA IMPORTADA",saldo:17},
      {nombre:"CERVEZA NACIONAL",saldo:165},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:100},
      {nombre:"GASEOSA 1.5",saldo:26},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:4},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:1},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:0},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:4},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-15", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:16},
      {nombre:"AGT BOTLLA CAUCA",saldo:2},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:24},
      {nombre:"AGUA TONICA",saldo:-2},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:17},
      {nombre:"CERVEZA IMPORTADA",saldo:17},
      {nombre:"CERVEZA NACIONAL",saldo:165},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:90},
      {nombre:"GASEOSA 1.5",saldo:26},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:0},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:3},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:0},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-16", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:15},
      {nombre:"AGT BOTLLA CAUCA",saldo:2},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:24},
      {nombre:"AGUA TONICA",saldo:-2},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:13},
      {nombre:"CERVEZA IMPORTADA",saldo:19},
      {nombre:"CERVEZA NACIONAL",saldo:163},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:88},
      {nombre:"GASEOSA 1.5",saldo:24},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:1},
      {nombre:"LICOR DE MANZANA",saldo:16},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:3},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:5},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-17", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:14},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:9},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:24},
      {nombre:"AGUA TONICA",saldo:10},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:28},
      {nombre:"CERVEZA IMPORTADA",saldo:41},
      {nombre:"CERVEZA NACIONAL",saldo:260},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:95},
      {nombre:"GASEOSA 1.5",saldo:23},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:3},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:15},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:11},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:4},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:3},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-18", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:14},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:9},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:15},
      {nombre:"AGUA TONICA",saldo:9},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:12},
      {nombre:"CERVEZA IMPORTADA",saldo:33},
      {nombre:"CERVEZA NACIONAL",saldo:253},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:87},
      {nombre:"GASEOSA 1.5",saldo:23},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:3},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:15},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:11},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-19", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:14},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:9},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:14},
      {nombre:"AGUA TONICA",saldo:9},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:10},
      {nombre:"CERVEZA IMPORTADA",saldo:33},
      {nombre:"CERVEZA NACIONAL",saldo:241},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:70},
      {nombre:"GASEOSA 1.5",saldo:23},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:3},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:15},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:11},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:2},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-20", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:14},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:9},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:13},
      {nombre:"AGUA TONICA",saldo:9},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:4},
      {nombre:"CERVEZA IMPORTADA",saldo:34},
      {nombre:"CERVEZA NACIONAL",saldo:238},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:56},
      {nombre:"GASEOSA 1.5",saldo:23},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:3},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:15},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:11},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:2},
      {nombre:"OLD PARR MEDIA",saldo:1}
    ]
  },
  {
    date: "2026-06-22", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:13},
      {nombre:"AGT BOTLLA CAUCA",saldo:10},
      {nombre:"AGT BOTLLA REAL",saldo:8},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:9},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:35},
      {nombre:"AGUA TONICA",saldo:9},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:49},
      {nombre:"CERVEZA IMPORTADA",saldo:69},
      {nombre:"CERVEZA NACIONAL",saldo:255},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:4},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:141},
      {nombre:"GASEOSA 1.5",saldo:22},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:3},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:13},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:11},
      {nombre:"RON CALDAS BOTELLA",saldo:2},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:5},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-06-23", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:15},
      {nombre:"AGT BOTLLA CAUCA",saldo:13},
      {nombre:"AGT BOTLLA REAL",saldo:6},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:11},
      {nombre:"AGT MEDIA CAUCA",saldo:9},
      {nombre:"AGUA",saldo:31},
      {nombre:"AGUA TONICA",saldo:9},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:6},
      {nombre:"CERVEZA IMPORTADA",saldo:63},
      {nombre:"CERVEZA NACIONAL",saldo:310},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:126},
      {nombre:"GASEOSA 1.5",saldo:19},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:3},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:13},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:10},
      {nombre:"RON CALDAS BOTELLA",saldo:2},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:4},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-06-24", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:15},
      {nombre:"AGT BOTLLA CAUCA",saldo:13},
      {nombre:"AGT BOTLLA REAL",saldo:6},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:11},
      {nombre:"AGT MEDIA CAUCA",saldo:9},
      {nombre:"AGUA",saldo:31},
      {nombre:"AGUA TONICA",saldo:9},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:6},
      {nombre:"CERVEZA IMPORTADA",saldo:59},
      {nombre:"CERVEZA NACIONAL",saldo:309},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:123},
      {nombre:"GASEOSA 1.5",saldo:19},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:3},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:13},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:10},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:4},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:2},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-06-25", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:15},
      {nombre:"AGT BOTLLA CAUCA",saldo:13},
      {nombre:"AGT BOTLLA REAL",saldo:6},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:11},
      {nombre:"AGT MEDIA CAUCA",saldo:8},
      {nombre:"AGUA",saldo:31},
      {nombre:"AGUA TONICA",saldo:7},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:6},
      {nombre:"CERVEZA IMPORTADA",saldo:58},
      {nombre:"CERVEZA NACIONAL",saldo:307},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:149},
      {nombre:"GASEOSA 1.5",saldo:19},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:3},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:12},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:10},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:4},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-06-26", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:15},
      {nombre:"AGT BOTLLA CAUCA",saldo:13},
      {nombre:"AGT BOTLLA REAL",saldo:6},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:11},
      {nombre:"AGT MEDIA CAUCA",saldo:7},
      {nombre:"AGUA",saldo:31},
      {nombre:"AGUA TONICA",saldo:6},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:5},
      {nombre:"CERVEZA IMPORTADA",saldo:55},
      {nombre:"CERVEZA NACIONAL",saldo:287},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:127},
      {nombre:"GASEOSA 1.5",saldo:18},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:3},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:10},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:4},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:0},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-06-27", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:9},
      {nombre:"AGT BOTLLA CAUCA",saldo:10},
      {nombre:"AGT BOTLLA REAL",saldo:6},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:29},
      {nombre:"AGUA TONICA",saldo:6},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:35},
      {nombre:"CERVEZA IMPORTADA",saldo:52},
      {nombre:"CERVEZA NACIONAL",saldo:284},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:132},
      {nombre:"GASEOSA 1.5",saldo:17},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:3},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:10},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:4},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:4},
      {nombre:"TRIPLESEC",saldo:4},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-06-28", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:9},
      {nombre:"AGT BOTLLA CAUCA",saldo:10},
      {nombre:"AGT BOTLLA REAL",saldo:6},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:29},
      {nombre:"AGUA TONICA",saldo:6},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:35},
      {nombre:"CERVEZA IMPORTADA",saldo:52},
      {nombre:"CERVEZA NACIONAL",saldo:284},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:122},
      {nombre:"GASEOSA 1.5",saldo:17},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:3},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:10},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:4},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-06-29", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:9},
      {nombre:"AGT BOTLLA CAUCA",saldo:10},
      {nombre:"AGT BOTLLA REAL",saldo:6},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:29},
      {nombre:"AGUA TONICA",saldo:6},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:35},
      {nombre:"CERVEZA IMPORTADA",saldo:49},
      {nombre:"CERVEZA NACIONAL",saldo:283},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:113},
      {nombre:"GASEOSA 1.5",saldo:17},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:3},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:10},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:4},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:4},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-06-30", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:9},
      {nombre:"AGT BOTLLA CAUCA",saldo:10},
      {nombre:"AGT BOTLLA REAL",saldo:6},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:29},
      {nombre:"AGUA TONICA",saldo:6},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:83},
      {nombre:"CERVEZA IMPORTADA",saldo:70},
      {nombre:"CERVEZA NACIONAL",saldo:326},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:6},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:102},
      {nombre:"GASEOSA 1.5",saldo:17},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:3},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:10},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:4},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-01", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:9},
      {nombre:"AGT BOTLLA CAUCA",saldo:10},
      {nombre:"AGT BOTLLA REAL",saldo:6},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:28},
      {nombre:"AGUA TONICA",saldo:6},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:81},
      {nombre:"CERVEZA IMPORTADA",saldo:64},
      {nombre:"CERVEZA NACIONAL",saldo:303},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:6},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:101},
      {nombre:"GASEOSA 1.5",saldo:17},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:2},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:10},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:2},
      {nombre:"TEQUILA BOTELLA",saldo:1},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:1},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:3},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-02", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:8},
      {nombre:"AGT BOTLLA CAUCA",saldo:10},
      {nombre:"AGT BOTLLA REAL",saldo:6},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:6},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:28},
      {nombre:"AGUA TONICA",saldo:5},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:1},
      {nombre:"AMARILLO MED",saldo:3},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:76},
      {nombre:"CERVEZA IMPORTADA",saldo:62},
      {nombre:"CERVEZA NACIONAL",saldo:290},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:5},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:103},
      {nombre:"GASEOSA 1.5",saldo:17},
      {nombre:"GINEBRA BOTELLA",saldo:2},
      {nombre:"GINEBRA DL",saldo:2},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:10},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:10},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:0},
      {nombre:"SMIRNOFF",saldo:1},
      {nombre:"SMIRNOFF BOT",saldo:1},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:2},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-03", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:13},
      {nombre:"AGT BOTLLA CAUCA",saldo:9},
      {nombre:"AGT BOTLLA REAL",saldo:6},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:6},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:27},
      {nombre:"AGUA TONICA",saldo:11},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:1},
      {nombre:"AMARILLO MED",saldo:3},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:34},
      {nombre:"CERVEZA IMPORTADA",saldo:56},
      {nombre:"CERVEZA NACIONAL",saldo:270},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:113},
      {nombre:"GASEOSA 1.5",saldo:15},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:2},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:10},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:9},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:0},
      {nombre:"SMIRNOFF",saldo:1},
      {nombre:"SMIRNOFF BOT",saldo:1},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-04", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:13},
      {nombre:"AGT BOTLLA CAUCA",saldo:9},
      {nombre:"AGT BOTLLA REAL",saldo:6},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:6},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:27},
      {nombre:"AGUA TONICA",saldo:11},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:1},
      {nombre:"AMARILLO MED",saldo:3},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:34},
      {nombre:"CERVEZA IMPORTADA",saldo:56},
      {nombre:"CERVEZA NACIONAL",saldo:265},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:104},
      {nombre:"GASEOSA 1.5",saldo:15},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:2},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:10},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:9},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:0},
      {nombre:"SMIRNOFF",saldo:1},
      {nombre:"SMIRNOFF BOT",saldo:1},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-05", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:13},
      {nombre:"AGT BOTLLA CAUCA",saldo:9},
      {nombre:"AGT BOTLLA REAL",saldo:6},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:6},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:27},
      {nombre:"AGUA TONICA",saldo:11},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:1},
      {nombre:"AMARILLO MED",saldo:3},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:34},
      {nombre:"CERVEZA IMPORTADA",saldo:56},
      {nombre:"CERVEZA NACIONAL",saldo:264},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:102},
      {nombre:"GASEOSA 1.5",saldo:15},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:2},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:10},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:9},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:0},
      {nombre:"SMIRNOFF",saldo:1},
      {nombre:"SMIRNOFF BOT",saldo:1},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-06", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:13},
      {nombre:"AGT BOTLLA CAUCA",saldo:9},
      {nombre:"AGT BOTLLA REAL",saldo:6},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:6},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:27},
      {nombre:"AGUA TONICA",saldo:11},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:1},
      {nombre:"AMARILLO MED",saldo:3},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:0},
      {nombre:"CERVEZA CORONA",saldo:34},
      {nombre:"CERVEZA IMPORTADA",saldo:51},
      {nombre:"CERVEZA NACIONAL",saldo:262},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:2},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:94},
      {nombre:"GASEOSA 1.5",saldo:15},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:2},
      {nombre:"GINEBRA ML",saldo:0},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:10},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:9},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:0},
      {nombre:"SMIRNOFF",saldo:1},
      {nombre:"SMIRNOFF BOT",saldo:1},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:0},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:6},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-07", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:7},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:6},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:9},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:21},
      {nombre:"AGUA TONICA",saldo:11},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:0},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:0},
      {nombre:"CERVEZA CORONA",saldo:7},
      {nombre:"CERVEZA IMPORTADA",saldo:43},
      {nombre:"CERVEZA NACIONAL",saldo:106},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:116},
      {nombre:"GASEOSA 1.5",saldo:18},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:2},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:8},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:0},
      {nombre:"SMIRNOFF",saldo:1},
      {nombre:"SMIRNOFF BOT",saldo:1},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:5},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-08", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:6},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:6},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:9},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:19},
      {nombre:"AGUA TONICA",saldo:11},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:0},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:0},
      {nombre:"CERVEZA CORONA",saldo:7},
      {nombre:"CERVEZA IMPORTADA",saldo:43},
      {nombre:"CERVEZA NACIONAL",saldo:96},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:110},
      {nombre:"GASEOSA 1.5",saldo:18},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:2},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:8},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:0},
      {nombre:"SMIRNOFF",saldo:1},
      {nombre:"SMIRNOFF BOT",saldo:1},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:5},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-09", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:6},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:6},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:9},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:19},
      {nombre:"AGUA TONICA",saldo:11},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:0},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:0},
      {nombre:"CERVEZA CORONA",saldo:8},
      {nombre:"CERVEZA IMPORTADA",saldo:41},
      {nombre:"CERVEZA NACIONAL",saldo:94},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:114},
      {nombre:"GASEOSA 1.5",saldo:18},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:2},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:8},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:0},
      {nombre:"SMIRNOFF",saldo:1},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:5},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-10", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:6},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:6},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:9},
      {nombre:"AGT MEDIA CAUCA",saldo:6},
      {nombre:"AGUA",saldo:18},
      {nombre:"AGUA TONICA",saldo:10},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:0},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:0},
      {nombre:"CERVEZA CORONA",saldo:5},
      {nombre:"CERVEZA IMPORTADA",saldo:41},
      {nombre:"CERVEZA NACIONAL",saldo:73},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:100},
      {nombre:"GASEOSA 1.5",saldo:18},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:2},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:8},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:0},
      {nombre:"SMIRNOFF",saldo:1},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:4},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-11", tipo: "final", derivado: true,
    nota: "INVENTARIO DERIVADO (sin tirilla física del sábado), CORREGIDO con la apertura autoritativa del domingo 12: AGT BOTLLA REAL 6→0 (⚠️ 6 botellas sin explicar: $257.400 costo / $540.000 venta — verificar si fue venta no registrada, traslado a El Búnker o faltante), CERVEZA NACIONAL 57→81 (reposición +24 el sábado), GASEOSA 85→97 (reposición +12), RON DL 0→3 (botella abierta → tragos dobles; explica la venta de ron sin stock).",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:6},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:9},
      {nombre:"AGT MEDIA CAUCA",saldo:5},
      {nombre:"AGUA",saldo:18},
      {nombre:"AGUA TONICA",saldo:9},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:0},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:0},
      {nombre:"CERVEZA CORONA",saldo:3},
      {nombre:"CERVEZA IMPORTADA",saldo:38},
      {nombre:"CERVEZA NACIONAL",saldo:81},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:97},
      {nombre:"GASEOSA 1.5",saldo:18},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:2},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:8},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:3},
      {nombre:"SMIRNOFF",saldo:1},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:4},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-12", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:6},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:9},
      {nombre:"AGT MEDIA CAUCA",saldo:5},
      {nombre:"AGUA",saldo:18},
      {nombre:"AGUA TONICA",saldo:6},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:0},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:0},
      {nombre:"CERVEZA CORONA",saldo:3},
      {nombre:"CERVEZA IMPORTADA",saldo:32},
      {nombre:"CERVEZA NACIONAL",saldo:69},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:91},
      {nombre:"GASEOSA 1.5",saldo:18},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:2},
      {nombre:"GINEBRA ML",saldo:0},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:8},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:3},
      {nombre:"SMIRNOFF",saldo:1},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-13", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:6},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:9},
      {nombre:"AGT MEDIA CAUCA",saldo:5},
      {nombre:"AGUA",saldo:18},
      {nombre:"AGUA TONICA",saldo:6},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:0},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:0},
      {nombre:"CERVEZA CORONA",saldo:3},
      {nombre:"CERVEZA IMPORTADA",saldo:32},
      {nombre:"CERVEZA NACIONAL",saldo:68},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:86},
      {nombre:"GASEOSA 1.5",saldo:17},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:2},
      {nombre:"GINEBRA ML",saldo:0},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:8},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:3},
      {nombre:"SMIRNOFF",saldo:1},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-14", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:6},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:9},
      {nombre:"AGT MEDIA CAUCA",saldo:5},
      {nombre:"AGUA",saldo:18},
      {nombre:"AGUA TONICA",saldo:6},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:0},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:0},
      {nombre:"CERVEZA CORONA",saldo:3},
      {nombre:"CERVEZA IMPORTADA",saldo:31},
      {nombre:"CERVEZA NACIONAL",saldo:62},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:82},
      {nombre:"GASEOSA 1.5",saldo:16},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:1},
      {nombre:"GINEBRA ML",saldo:0},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:8},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:0},
      {nombre:"SMIRNOFF",saldo:1},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-15", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:6},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:9},
      {nombre:"AGT MEDIA CAUCA",saldo:5},
      {nombre:"AGUA",saldo:16},
      {nombre:"AGUA TONICA",saldo:6},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:0},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:0},
      {nombre:"CERVEZA CORONA",saldo:3},
      {nombre:"CERVEZA IMPORTADA",saldo:31},
      {nombre:"CERVEZA NACIONAL",saldo:120},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:76},
      {nombre:"GASEOSA 1.5",saldo:16},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:1},
      {nombre:"GINEBRA ML",saldo:0},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:8},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:0},
      {nombre:"SMIRNOFF",saldo:1},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-16", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:5},
      {nombre:"AGT BOTLLA CAUCA",saldo:5},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:4},
      {nombre:"AGUA",saldo:13},
      {nombre:"AGUA TONICA",saldo:6},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:0},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:2},
      {nombre:"CERVEZA IMPORTADA",saldo:28},
      {nombre:"CERVEZA NACIONAL",saldo:99},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:2},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:115},
      {nombre:"GASEOSA 1.5",saldo:14},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:1},
      {nombre:"GINEBRA ML",saldo:0},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:9},
      {nombre:"LICOR DE MENTA",saldo:1},
      {nombre:"RED BULL",saldo:8},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:0},
      {nombre:"SMIRNOFF",saldo:0},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-17", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:5},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:9},
      {nombre:"AGUA TONICA",saldo:3},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:1},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:2},
      {nombre:"CERVEZA IMPORTADA",saldo:28},
      {nombre:"CERVEZA NACIONAL",saldo:56},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:2},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:0},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:93},
      {nombre:"GASEOSA 1.5",saldo:13},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:10},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:8},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:5},
      {nombre:"SMIRNOFF",saldo:0},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:4},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-18", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:2},
      {nombre:"AGT BOTLLA CAUCA",saldo:2},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:5},
      {nombre:"AGUA TONICA",saldo:3},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:1},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:49},
      {nombre:"CERVEZA IMPORTADA",saldo:24},
      {nombre:"CERVEZA NACIONAL",saldo:197},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:2},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:16},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:78},
      {nombre:"GASEOSA 1.5",saldo:13},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:0},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:9},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:8},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:5},
      {nombre:"SMIRNOFF",saldo:0},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:2},
      {nombre:"TRIPLESEC",saldo:1},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-19", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:2},
      {nombre:"AGT BOTLLA CAUCA",saldo:2},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:16},
      {nombre:"AGUA TONICA",saldo:8},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:1},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:48},
      {nombre:"CERVEZA IMPORTADA",saldo:22},
      {nombre:"CERVEZA NACIONAL",saldo:190},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:2},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:16},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:70},
      {nombre:"GASEOSA 1.5",saldo:13},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:0},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:9},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:8},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:3},
      {nombre:"SMIRNOFF",saldo:0},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:2},
      {nombre:"TRIPLESEC",saldo:1},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:0},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-20", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:2},
      {nombre:"AGT BOTLLA CAUCA",saldo:2},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:15},
      {nombre:"AGUA TONICA",saldo:8},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:1},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:48},
      {nombre:"CERVEZA IMPORTADA",saldo:19},
      {nombre:"CERVEZA NACIONAL",saldo:175},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:2},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:16},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:62},
      {nombre:"GASEOSA 1.5",saldo:13},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:0},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:7},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:8},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:3},
      {nombre:"SMIRNOFF",saldo:0},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:1},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:0},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-21", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:2},
      {nombre:"AGT BOTLLA CAUCA",saldo:2},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:15},
      {nombre:"AGUA TONICA",saldo:8},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:1},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:46},
      {nombre:"CERVEZA IMPORTADA",saldo:19},
      {nombre:"CERVEZA NACIONAL",saldo:170},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:2},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:14},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:56},
      {nombre:"GASEOSA 1.5",saldo:12},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:0},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:6},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:8},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:3},
      {nombre:"SMIRNOFF",saldo:0},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:0},
      {nombre:"TRIPLESEC",saldo:1},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:0},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-22", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:2},
      {nombre:"AGT BOTLLA CAUCA",saldo:2},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:15},
      {nombre:"AGUA TONICA",saldo:8},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:1},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:43},
      {nombre:"CERVEZA IMPORTADA",saldo:19},
      {nombre:"CERVEZA NACIONAL",saldo:157},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:14},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:46},
      {nombre:"GASEOSA 1.5",saldo:12},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:4},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:5},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:8},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:3},
      {nombre:"SMIRNOFF",saldo:0},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:5},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:0},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-23", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:2},
      {nombre:"AGT BOTLLA CAUCA",saldo:2},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:15},
      {nombre:"AGUA TONICA",saldo:8},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:1},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:40},
      {nombre:"CERVEZA IMPORTADA",saldo:22},
      {nombre:"CERVEZA NACIONAL",saldo:142},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:14},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:39},
      {nombre:"GASEOSA 1.5",saldo:12},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:5},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:4},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:8},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:3},
      {nombre:"SMIRNOFF",saldo:0},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:5},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:0},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-24", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:2},
      {nombre:"AGT BOTLLA CAUCA",saldo:2},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:14},
      {nombre:"AGUA TONICA",saldo:4},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:0},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:35},
      {nombre:"CERVEZA IMPORTADA",saldo:19},
      {nombre:"CERVEZA NACIONAL",saldo:132},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:14},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:26},
      {nombre:"GASEOSA 1.5",saldo:12},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:4},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:3},
      {nombre:"SMIRNOFF",saldo:0},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:4},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:0},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-25", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:3},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:6},
      {nombre:"AGT MEDIA CAUCA",saldo:3},
      {nombre:"AGUA",saldo:14},
      {nombre:"AGUA TONICA",saldo:9},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"AMARILLO BOT",saldo:1},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:3},
      {nombre:"CERVEZA CORONA",saldo:34},
      {nombre:"CERVEZA IMPORTADA",saldo:9},
      {nombre:"CERVEZA NACIONAL",saldo:131},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:14},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:64},
      {nombre:"GASEOSA 1.5",saldo:11},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:4},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:3},
      {nombre:"SMIRNOFF",saldo:0},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:0},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-26", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:4},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:8},
      {nombre:"AGT MEDIA CAUCA",saldo:3},
      {nombre:"AGUA",saldo:13},
      {nombre:"AGUA TONICA",saldo:8},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"AMARILLO BOT",saldo:1},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:3},
      {nombre:"CERVEZA CORONA",saldo:34},
      {nombre:"CERVEZA IMPORTADA",saldo:9},
      {nombre:"CERVEZA NACIONAL",saldo:143},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:14},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:59},
      {nombre:"GASEOSA 1.5",saldo:11},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:4},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:3},
      {nombre:"SMIRNOFF",saldo:0},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:0},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-27", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:4},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:8},
      {nombre:"AGT MEDIA CAUCA",saldo:3},
      {nombre:"AGUA",saldo:12},
      {nombre:"AGUA TONICA",saldo:8},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"AMARILLO BOT",saldo:1},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:34},
      {nombre:"CERVEZA IMPORTADA",saldo:7},
      {nombre:"CERVEZA NACIONAL",saldo:139},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:14},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:57},
      {nombre:"GASEOSA 1.5",saldo:11},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:4},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:3},
      {nombre:"SMIRNOFF",saldo:0},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:0},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-28", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:4},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:8},
      {nombre:"AGT MEDIA CAUCA",saldo:3},
      {nombre:"AGUA",saldo:12},
      {nombre:"AGUA TONICA",saldo:8},
      {nombre:"AMARETTO",saldo:1},
      {nombre:"AMARILLO BOT",saldo:1},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:34},
      {nombre:"CERVEZA IMPORTADA",saldo:7},
      {nombre:"CERVEZA NACIONAL",saldo:136},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:1},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:14},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:54},
      {nombre:"GASEOSA 1.5",saldo:11},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:4},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:3},
      {nombre:"SMIRNOFF",saldo:0},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:3},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:5},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:0},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-29", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:4},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:8},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:9},
      {nombre:"AGUA TONICA",saldo:6},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:1},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:57},
      {nombre:"CERVEZA IMPORTADA",saldo:27},
      {nombre:"CERVEZA NACIONAL",saldo:249},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:14},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:70},
      {nombre:"GASEOSA 1.5",saldo:11},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:1},
      {nombre:"SMIRNOFF",saldo:0},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:5},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:0},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-30", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:4},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:8},
      {nombre:"AGT MEDIA CAUCA",saldo:2},
      {nombre:"AGUA",saldo:33},
      {nombre:"AGUA TONICA",saldo:6},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:0},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:54},
      {nombre:"CERVEZA IMPORTADA",saldo:26},
      {nombre:"CERVEZA NACIONAL",saldo:247},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:14},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:123},
      {nombre:"GASEOSA 1.5",saldo:11},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:13},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:1},
      {nombre:"SMIRNOFF",saldo:0},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:0},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:4},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:0},
      {nombre:"BUCHANAN'S MEDIA",saldo:0},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:0},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-07-31", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:5},
      {nombre:"AGT BOTLLA CAUCA",saldo:4},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:4},
      {nombre:"AGUA",saldo:32},
      {nombre:"AGUA TONICA",saldo:5},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:2},
      {nombre:"AMARILLO MED",saldo:0},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:1},
      {nombre:"CERVEZA CORONA",saldo:26},
      {nombre:"CERVEZA IMPORTADA",saldo:24},
      {nombre:"CERVEZA NACIONAL",saldo:215},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:14},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:90},
      {nombre:"GASEOSA 1.5",saldo:10},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:2},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:11},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:2},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:1},
      {nombre:"SMIRNOFF",saldo:6},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:2},
      {nombre:"TRIPLESEC",saldo:2},
      {nombre:"VINO BOTELLA",saldo:0},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-08-01", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:0},
      {nombre:"AGT BOTLLA CAUCA",saldo:7},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:4},
      {nombre:"AGUA",saldo:30},
      {nombre:"AGUA TONICA",saldo:9},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:2},
      {nombre:"AMARILLO MED",saldo:2},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:3},
      {nombre:"CERVEZA CORONA",saldo:23},
      {nombre:"CERVEZA IMPORTADA",saldo:23},
      {nombre:"CERVEZA NACIONAL",saldo:186},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:14},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:104},
      {nombre:"GASEOSA 1.5",saldo:10},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:10},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:1},
      {nombre:"SMIRNOFF",saldo:6},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:2},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:1},
      {nombre:"VINO BOTELLA",saldo:2},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-08-02", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:0},
      {nombre:"AGT BOTLLA CAUCA",saldo:7},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:4},
      {nombre:"AGUA",saldo:29},
      {nombre:"AGUA TONICA",saldo:9},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:2},
      {nombre:"AMARILLO MED",saldo:2},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:3},
      {nombre:"CERVEZA CORONA",saldo:23},
      {nombre:"CERVEZA IMPORTADA",saldo:23},
      {nombre:"CERVEZA NACIONAL",saldo:174},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:14},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:102},
      {nombre:"GASEOSA 1.5",saldo:9},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:10},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:1},
      {nombre:"SMIRNOFF",saldo:6},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:1},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-08-03", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:0},
      {nombre:"AGT BOTLLA CAUCA",saldo:7},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:4},
      {nombre:"AGUA",saldo:29},
      {nombre:"AGUA TONICA",saldo:9},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:2},
      {nombre:"AMARILLO MED",saldo:2},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:3},
      {nombre:"CERVEZA CORONA",saldo:23},
      {nombre:"CERVEZA IMPORTADA",saldo:23},
      {nombre:"CERVEZA NACIONAL",saldo:171},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:14},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:152},
      {nombre:"GASEOSA 1.5",saldo:9},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:4},
      {nombre:"GINEBRA ML",saldo:1},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:10},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:2},
      {nombre:"RON DL",saldo:1},
      {nombre:"SMIRNOFF",saldo:6},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:1},
      {nombre:"TRIPLESEC",saldo:1},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:1},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-08-04", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:0},
      {nombre:"AGT BOTLLA CAUCA",saldo:7},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:3},
      {nombre:"AGUA",saldo:28},
      {nombre:"AGUA TONICA",saldo:9},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:2},
      {nombre:"AMARILLO MED",saldo:2},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:3},
      {nombre:"CERVEZA CORONA",saldo:20},
      {nombre:"CERVEZA IMPORTADA",saldo:23},
      {nombre:"CERVEZA NACIONAL",saldo:169},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:14},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:140},
      {nombre:"GASEOSA 1.5",saldo:9},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:3},
      {nombre:"GINEBRA ML",saldo:5},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:10},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:1},
      {nombre:"RON DL",saldo:0},
      {nombre:"SMIRNOFF",saldo:6},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:11},
      {nombre:"TRIPLESEC",saldo:4},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-08-05", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:0},
      {nombre:"AGT BOTLLA CAUCA",saldo:7},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:3},
      {nombre:"AGUA",saldo:28},
      {nombre:"AGUA TONICA",saldo:5},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:2},
      {nombre:"AMARILLO MED",saldo:2},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:3},
      {nombre:"CERVEZA CORONA",saldo:16},
      {nombre:"CERVEZA IMPORTADA",saldo:23},
      {nombre:"CERVEZA NACIONAL",saldo:165},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:14},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:122},
      {nombre:"GASEOSA 1.5",saldo:9},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:3},
      {nombre:"GINEBRA ML",saldo:4},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:10},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:4},
      {nombre:"SMIRNOFF",saldo:6},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:10},
      {nombre:"TRIPLESEC",saldo:4},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-08-06", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:1},
      {nombre:"AGT BOTLLA CAUCA",saldo:7},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:3},
      {nombre:"AGUA",saldo:23},
      {nombre:"AGUA TONICA",saldo:4},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:2},
      {nombre:"AMARILLO MED",saldo:2},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:2},
      {nombre:"CERVEZA CORONA",saldo:12},
      {nombre:"CERVEZA IMPORTADA",saldo:23},
      {nombre:"CERVEZA NACIONAL",saldo:124},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:14},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:104},
      {nombre:"GASEOSA 1.5",saldo:9},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:3},
      {nombre:"GINEBRA ML",saldo:4},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:10},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:4},
      {nombre:"SMIRNOFF",saldo:6},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:9},
      {nombre:"TRIPLESEC",saldo:4},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-08-07", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:1},
      {nombre:"AGT BOTLLA CAUCA",saldo:7},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:6},
      {nombre:"AGT MEDIA CAUCA",saldo:3},
      {nombre:"AGUA",saldo:23},
      {nombre:"AGUA TONICA",saldo:4},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:2},
      {nombre:"AMARILLO MED",saldo:2},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:3},
      {nombre:"CERVEZA CORONA",saldo:10},
      {nombre:"CERVEZA IMPORTADA",saldo:21},
      {nombre:"CERVEZA NACIONAL",saldo:121},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:3},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:14},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:99},
      {nombre:"GASEOSA 1.5",saldo:8},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:3},
      {nombre:"GINEBRA ML",saldo:4},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:10},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:1},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:4},
      {nombre:"SMIRNOFF",saldo:6},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:2},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:9},
      {nombre:"TRIPLESEC",saldo:4},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:1},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  },
  {
    date: "2026-08-08", tipo: "final",
    items: [
      {nombre:"AGT BOTLLA ANQUEÑ",saldo:3},
      {nombre:"AGT BOTLLA CAUCA",saldo:7},
      {nombre:"AGT BOTLLA REAL",saldo:0},
      {nombre:"AGT MEDIA ANQUEÑ",saldo:7},
      {nombre:"AGT MEDIA CAUCA",saldo:3},
      {nombre:"AGUA",saldo:21},
      {nombre:"AGUA TONICA",saldo:10},
      {nombre:"AMARETTO",saldo:0},
      {nombre:"AMARILLO BOT",saldo:2},
      {nombre:"AMARILLO MED",saldo:2},
      {nombre:"CACHAZA",saldo:0},
      {nombre:"CAJA DE VINO",saldo:3},
      {nombre:"CERVEZA CORONA",saldo:28},
      {nombre:"CERVEZA IMPORTADA",saldo:16},
      {nombre:"CERVEZA NACIONAL",saldo:107},
      {nombre:"CHICLETS",saldo:0},
      {nombre:"CIGARRILLOS",saldo:0},
      {nombre:"CREMA DE WHISKY",saldo:0},
      {nombre:"CURAZAO AZUL",saldo:2},
      {nombre:"DRY MARTINY",saldo:1},
      {nombre:"ELECTROLIT",saldo:12},
      {nombre:"ENCENDEDOR",saldo:0},
      {nombre:"GASEOSA",saldo:101},
      {nombre:"GASEOSA 1.5",saldo:7},
      {nombre:"GINEBRA BOTELLA",saldo:0},
      {nombre:"GINEBRA DL",saldo:3},
      {nombre:"GINEBRA ML",saldo:3},
      {nombre:"LICOR CAFÉ",saldo:0},
      {nombre:"LICOR DE MANZANA",saldo:9},
      {nombre:"LICOR DE MENTA",saldo:0},
      {nombre:"RED BULL",saldo:7},
      {nombre:"RON CALDAS BOTELLA",saldo:0},
      {nombre:"RON CALDAS MEDIA",saldo:0},
      {nombre:"RON DL",saldo:4},
      {nombre:"SMIRNOFF",saldo:6},
      {nombre:"SMIRNOFF BOT",saldo:0},
      {nombre:"TEQUILA BOTELLA",saldo:3},
      {nombre:"TEQUILA LITRO",saldo:0},
      {nombre:"TEQUILA MEDIA",saldo:1},
      {nombre:"TEQUILA ML",saldo:7},
      {nombre:"TRIPLESEC",saldo:3},
      {nombre:"VINO BOTELLA",saldo:1},
      {nombre:"VINO CASILLERO BOTELLA",saldo:0},
      {nombre:"VODKA BOTELLA",saldo:0},
      {nombre:"VODKA MEDIA",saldo:0},
      {nombre:"VODKA DL",saldo:4},
      {nombre:"BUCHANAN'S BOTELLA",saldo:1},
      {nombre:"BUCHANAN'S MEDIA",saldo:1},
      {nombre:"WHISKEY COCTELERIA",saldo:0},
      {nombre:"OLD PARR BOTELLA",saldo:0},
      {nombre:"OLD PARR MEDIA",saldo:1},
      {nombre:"SMIRNOFF ICE",saldo:6},
      {nombre:"SMIRNOFF GREEN APPLE",saldo:6}
    ]
  }
];


const PRELOADED_GASTOS = [
  {
    date: "2026-04-01", total: 453000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "Servilletas, azúcar, jugo Valle, bolsas, trapero, escoba", categoria: "Insumos", valor: 42000 },
      { concepto: "1 canasta soda + domicilio", categoria: "Bebidas", valor: 75000 },
      { concepto: "7 bolsas hielo", categoria: "Hielo", valor: 55000 },
      { concepto: "Mermeladas, manzana, piña, mango, agraz, six leche, toalla cocina", categoria: "Frutas/Insumos", valor: 146000 },
      { concepto: "Limón x bulto", categoria: "Frutas", valor: 90000 },
      { concepto: "Medio x limón", categoria: "Frutas", valor: 40000 },
    ]
  },
  {
    date: "2026-04-02", total: 727600,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "1 bulto limón", categoria: "Frutas", valor: 100000 },
      { concepto: "Cereza, 6 crema leche, 1 paq mentas", categoria: "Insumos", valor: 274000 },
      { concepto: "4 six Stella + 3 six Heineken", categoria: "Bebidas/Licor", valor: 144000 },
      { concepto: "1 vino caja + 1 vino botella", categoria: "Bebidas/Licor", valor: 46000 },
      { concepto: "1 domicilio L.Jr", categoria: "Domicilios", valor: 5000 },
      { concepto: "1 licor Don Luis (faltante)", categoria: "Bebidas/Licor", valor: 37000 },
      { concepto: "1 AGT Botella", categoria: "Bebidas/Licor", valor: 55000 },
      { concepto: "Jugo mandarina, mermeladas, 3 servilletas, 2 paño absorbente, toalla cocina", categoria: "Insumos", valor: 46600 },
      { concepto: "2 domicilios L.Jr", categoria: "Domicilios", valor: 10000 },
    ]
  },
  {
    date: "2026-04-03", total: 301400,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
      { concepto: "Gomas frozen, surtidas (5pq), 2 cabo madera, 2 manzanas verdes, 1 manzanas rojas, 3 toallas absorbentes", categoria: "Insumos", valor: 61400 },
      { concepto: "4 bolsas hielo + domicilio", categoria: "Hielo", valor: 50000 },
      { concepto: "1 canasta Poker + 1 six Corona", categoria: "Bebidas/Licor", valor: 80000 },
      { concepto: "1 juego tubería, orinal, 2 cinta teflón, pegante", categoria: "Mantenimiento", valor: 50000 },
      { concepto: "4 bolsas hielo", categoria: "Hielo", valor: 50000 },
    ]
  },
  {
    date: "2026-04-04", total: 403000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "1 Corona + 2 Club Dorada + 1 domicilio", categoria: "Bebidas/Licor", valor: 298000 },
      { concepto: "5 Ron", categoria: "Bebidas/Licor", valor: 100000 },
    ]
  },
  {
    date: "2026-04-05", total: 165700,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "Postobón", categoria: "Bebidas", valor: 160700 },
    ]
  },
  {
    date: "2026-04-06", total: 1437900,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "Ron", categoria: "Bebidas/Licor", valor: 100000 },
      { concepto: "Cerezas, mentas, 6 crema de leche", categoria: "Insumos", valor: 247000 },
      { concepto: "18 Coronas, botellas", categoria: "Bebidas/Licor", valor: 105500 },
      { concepto: "Coco rayado", categoria: "Insumos", valor: 65000 },
      { concepto: "2 toalla cocina, 6 crema de leche, 4 del Valle", categoria: "Insumos", valor: 145400 },
      { concepto: "3 botellas vino, 2 crema de leche", categoria: "Bebidas/Licor", valor: 119000 },
      { concepto: "2 mentas, 6 copas", categoria: "Insumos", valor: 102000 },
      { concepto: "Hierbabuena, carambolo, mango, naranjas, uvas, fresas", categoria: "Frutas", valor: 80000 },
      { concepto: "6 crema de leche", categoria: "Insumos", valor: 132000 },
      { concepto: "6 vaso mojito, 4 rocheros, 1 mentas", categoria: "Insumos", valor: 72000 },
      { concepto: "Mantenimiento baños", categoria: "Mantenimiento", valor: 265000 },
    ]
  },
  {
    date: "2026-04-18", total: 10000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
    ]
  },
  {
    date: "2026-04-19", total: 28000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "Platos plásticos + 2 bolsas hielo", categoria: "Insumos", valor: 23000 },
    ]
  },
  {
    date: "2026-04-20", total: 5000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
    ]
  },
  {
    date: "2026-04-21", total: 5000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
    ]
  },
  {
    date: "2026-04-23", total: 144100,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "Canasta dorada", categoria: "Insumos", valor: 90000 },
      { concepto: "Smirnoff Lulo", categoria: "Bebidas/Licor", valor: 49100 },
    ]
  },
  {
    date: "2026-04-24", total: 10000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
    ]
  },
  {
    date: "2026-04-25", total: 152000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
      { concepto: "Copias inventario", categoria: "Insumos", valor: 4000 },
      { concepto: "2 Coca Cola litro", categoria: "Bebidas", valor: 13000 },
      { concepto: "Centinela", categoria: "Bebidas/Licor", valor: 125000 },
    ]
  },
  {
    date: "2026-04-26", total: 36900,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "Servilletas, paño absorbente, toalla cocina, limpiavidrios, limpiatodo, bolsa", categoria: "Insumos", valor: 31900 },
    ]
  },
  {
    date: "2026-04-27", total: 44400,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "Faltante tarjeta", categoria: "Faltante", valor: 9500 },
      { concepto: "(2) Jugo del Valle + (3) Gomas surtidas", categoria: "Insumos", valor: 20900 },
      { concepto: "(2) Rodachines TV", categoria: "Mantenimiento", valor: 9000 },
    ]
  },
  {
    date: "2026-04-28", total: 409900,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "1/2 limón", categoria: "Insumos coctelería", valor: 120000 },
      { concepto: "Frutas/hierbas (uvas, maracuyá, romero, hierbabuena, naranja, fresas) + domicilio", categoria: "Insumos coctelería", valor: 54000 },
      { concepto: "Toalla cocina, paños, azúcar blanca, naranja", categoria: "Insumos", valor: 30900 },
      { concepto: "Préstamo Erika", categoria: "Préstamo (no operativo)", valor: 200000 },
    ]
  },
  {
    date: "2026-04-29", total: 11500,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "Cinta transparente", categoria: "Insumos", valor: 5000 },
      { concepto: "Faltante tarjeta", categoria: "Faltante", valor: 1500 },
    ]
  },
  {
    date: "2026-04-30", total: 446750,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
      { concepto: "Préstamo Erika", categoria: "Préstamo (no operativo)", valor: 300000 },
      { concepto: "1 Media Antioqueño", categoria: "Bebidas/Licor", valor: 30600 },
      { concepto: "Servilletas, naranjas, toalla cocina, del valle, gomitas, jugo mandarina, leche, paño absorbente", categoria: "Insumos", valor: 50150 },
      { concepto: "Frutas/hierbas (piña, fresa, uchuvas, pulpa mango, agraz, aromáticas, uva, maracuyá, manzana)", categoria: "Insumos coctelería", valor: 56000 },
    ]
  },
  {
    date: "2026-05-01", total: 26000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
      { concepto: "Hierbabuena, naranjas, mango", categoria: "Insumos coctelería", valor: 16000 },
    ]
  },
  {
    date: "2026-05-02", total: 146300,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
      { concepto: "(4) Azúcar blanca + (2) Bolsas hielo", categoria: "Insumos", valor: 32000 },
      { concepto: "(5) Coco rayado + Hierbabuena", categoria: "Insumos coctelería", valor: 70000 },
      { concepto: "(2) Jugo del Valle + (1) Pitillos", categoria: "Insumos", valor: 20000 },
      { concepto: "(2) Servilletas + (2) Lavaloza + (1) Bolsas basura", categoria: "Insumos", valor: 14300 },
    ]
  },
  {
    date: "2026-05-03", total: 5000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
    ]
  },
  {
    date: "2026-05-04", total: 5000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
    ]
  },
  {
    date: "2026-05-05", total: 0,
    items: []
  },
  {
    date: "2026-05-06", total: 12850,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
      { concepto: "Blanqueador (D1 - Fact. H6Z9437552)", categoria: "Aseo", valor: 2850 },
    ]
  },
  {
    date: "2026-05-07", total: 5000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
    ]
  },
  {
    date: "2026-05-08", total: 88000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
      { concepto: "Domicilio casa limpia", categoria: "Aseo", valor: 5000 },
      { concepto: "Toalla cocina, repuesto trapero, servilletas, paños, limpiatodo, azúcar, leche, gomitas, salsa piña", categoria: "Insumos", valor: 73000 },
    ]
  },
  {
    date: "2026-05-09", total: 23800,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
      { concepto: "6 unidades agua tónica", categoria: "Insumos bar", valor: 13800 },
    ]
  },
  {
    date: "2026-05-10", total: 193500,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "3 Antioqueño Botella (factura DIAN)", categoria: "Compra Licores", valor: 151500 },
      { concepto: "2 kilos azúcar, naranjas, mermeladas, leche, jugo mandarina", categoria: "Insumos cocina/bar", valor: 37000 },
    ]
  },
  {
    date: "2026-05-11", total: 5000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
    ]
  },
  {
    date: "2026-05-12", total: 5000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
    ]
  },
  {
    date: "2026-05-13", total: 5000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
    ]
  },
  {
    date: "2026-05-14", total: 179000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "5 botellas Ron DL", categoria: "Bebidas/Licor", valor: 100000 },
      { concepto: "Salsa piña, toalla cocina, leche, whisky", categoria: "Insumos varios", valor: 67000 },
      { concepto: "Duplicado llaves", categoria: "Mantenimiento", valor: 7000 },
    ]
  },
  {
    date: "2026-05-15", total: 120000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
      { concepto: "Limones", categoria: "Insumos coctelería", valor: 110000 },
    ]
  },
  {
    date: "2026-05-16", total: 707100,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
      { concepto: "Ron DL", categoria: "Bebidas/Licor", valor: 100000 },
      { concepto: "Hielo, servilletas", categoria: "Insumos varios", valor: 46900 },
      { concepto: "Bavaria", categoria: "Bebidas/Licor", valor: 525200 },
      { concepto: "1 Vino Botella", categoria: "Bebidas/Licor", valor: 25000 },
    ]
  },
  {
    date: "2026-05-17", total: 65150,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "Gomitas, servilletas, toalla cocina, paño abs, Del Valle, jugo mandarina, naranjas", categoria: "Insumos varios", valor: 60150 },
    ]
  },
  {
    date: "2026-05-18", total: 5000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
    ]
  },
  {
    date: "2026-05-20", total: 10000,
    items: [
      { concepto: "Comida empleados 19 may", categoria: "Comida", valor: 5000 },
      { concepto: "Comida empleados 20 may", categoria: "Comida", valor: 5000 },
    ]
  },
  {
    date: "2026-05-21", total: 84600,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "Limones", categoria: "Insumos coctelería", valor: 79600 },
    ]
  },
  {
    date: "2026-05-22", total: 141000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
      { concepto: "5 Bolsas de Hielo", categoria: "Hielo", valor: 33500 },
      { concepto: "1 Aceitunas + 2 Crema de Leche", categoria: "Insumos coctelería", valor: 47000 },
      { concepto: "1 Inflador Bombas + 2 Bases Decoraciones", categoria: "Insumos varios", valor: 30500 },
      { concepto: "Domicilios Jueves", categoria: "Domicilios", valor: 10000 },
      { concepto: "Cigarrillos", categoria: "Insumos varios", valor: 10000 },
    ]
  },
  {
    date: "2026-05-23", total: 364600,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
      { concepto: "D1: 3 Servilletas + 2 Toallas Cocina + 1 Detergente + 2 Jugo del Valle + 24 Soda Bretaña", categoria: "Insumos varios", valor: 89050 },
      { concepto: "1 Naranja + 1 Hierbabuena", categoria: "Insumos coctelería", valor: 12000 },
      { concepto: "Paquete velas cumple", categoria: "Insumos varios", valor: 6000 },
      { concepto: "2 Canasta Poker + 1 Club Dorada + domicilio (Cervezas y Cervezas)", categoria: "Bebidas/Licor", valor: 166300 },
      { concepto: "5 Azúcar Blanca (D1)", categoria: "Insumos coctelería", valor: 17250 },
      { concepto: "1 Coco Rayado", categoria: "Insumos coctelería", valor: 64000 },
    ]
  },
  {
    date: "2026-05-25", total: 10000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
    ]
  },
  {
    date: "2026-05-27", total: 32600,
    items: [
      { concepto: "Cepillo de sanitario", categoria: "Insumos varios", valor: 8000 },
      { concepto: "Domicilio", categoria: "Domicilios", valor: 5000 },
      { concepto: "D1: 1 Limpiador Todo + 1 Encendedor", categoria: "Insumos varios", valor: 9600 },
      { concepto: "Comida empleados (martes 26 + miércoles 27, $5k c/u)", categoria: "Comida", valor: 10000 },
    ]
  },
  {
    date: "2026-05-28", total: 100100,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "D1: paños reutilizables + toalla cocina + servilletas + azúcar blanca + leche deslac + gomas surtidas + naranjas + encendedor + paño microfibra + lavaloza + helados (gomitas) + jugo mandarina + limpiavidrios (24 art.)", categoria: "Insumos varios", valor: 95100 },
    ]
  },
  {
    date: "2026-05-29", total: 193850,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
      { concepto: "Aseo general (servicio miércoles 27 may)", categoria: "Aseo/Servicios", valor: 70000 },
      { concepto: "Insumos coctelería: Hierbabuena $10k + Romero $6k + Uvas 2lb $7k", categoria: "Insumos coctelería", valor: 23000 },
      { concepto: "Coca-Cola (FE soporte entrega $87.845 + envases $3.005)", categoria: "Bebidas/Proveedor", valor: 90850 },
    ]
  },
  {
    date: "2026-05-30", total: 159700,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
      { concepto: "3 Vasos rojos plásticos 16oz + bolsa (Dollarcity) + domicilio $5k", categoria: "Insumos varios", valor: 33500 },
      { concepto: "D1: servilletas, esponjas, toallas cocina, mermeladas, azúcar, jugos (piña/lulo/fresa/naranja/manzana) (16 art., neto tras ajuste -$3k)", categoria: "Insumos varios", valor: 78900 },
      { concepto: "Palillos de madera para decorar cócteles", categoria: "Insumos coctelería", valor: 2000 },
      { concepto: "Frutas (Placita Campesina: carambolo, pulpa fresa, pulpa mango, fresa bandeja) + domicilio $5k", categoria: "Insumos coctelería", valor: 35270 },
    ]
  },
  {
    date: "2026-06-01", total: 11200,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "Sobrante tarjetas (ajuste de cuadre)", categoria: "Ajuste caja", valor: 6200 },
    ]
  },
  {
    date: "2026-06-02", total: 32100,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "2 bolsas de hielo ($3k c/u, cuenta de cobro La Sala)", categoria: "Insumos coctelería", valor: 6000 },
      { concepto: "Faltante tarjetas (ajuste de cuadre)", categoria: "Ajuste caja", valor: 21100 },
    ]
  },
  {
    date: "2026-06-03", total: 5000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000, nota: "Sin foto de gastos; total tomado de la línea GASTOS del cuadre ($5.000)" },
    ]
  },
  {
    date: "2026-06-04", total: 94200,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "Toalla cocina, azúcar, mermelada, servilletas (D1)", categoria: "Insumos cocina", valor: 27800 },
      { concepto: "Aguardiente Amarillo media (Licores Junior, fact. F1JCG6182 ~$27.400)", categoria: "Compra Licores", valor: 31400 },
      { concepto: "Paca Coca-Cola (entrega $92.500, solo se pagó $30k efectivo; resto pendiente)", categoria: "Bebidas no alcohólicas", valor: 30000 },
    ]
  },
  {
    date: "2026-06-05", total: 10000,
    items: [
      { concepto: "Gastos en efectivo del día (sin foto; total de la línea GASTOS del cuadre)", categoria: "Varios", valor: 10000 },
    ]
  },
  {
    date: "2026-06-06", total: 94600,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
      { concepto: "5 bolsas de hielo (Carantanta, fact. FVCA8620)", categoria: "Insumos coctelería", valor: 32500 },
      { concepto: "Repuesto trapero/escoba, servilletas, miel, azúcar, Del Valle, gomitas (01 SAS, total $52.140 − ajuste)", categoria: "Insumos varios", valor: 52100 },
    ]
  },
  {
    date: "2026-06-07", total: 5000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000, nota: "Sin foto de gastos; total tomado de la línea GASTOS del cuadre ($5.000)" },
    ]
  },
  {
    date: "2026-06-08", total: 105000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "Limones/cítricos (Cítricos Narváez, fact. 11446: limón tahití, maracuyá, tomate, mandarina, naranja, papaya, aguacate)", categoria: "Insumos coctelería", valor: 100000 },
    ]
  },
  {
    date: "2026-06-09", total: 20100,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "Adhesivos / ganchos auto-adhesivos (Dollarcity)", categoria: "Insumos varios", valor: 5000 },
      { concepto: "Desinfectante + limpiatodo (01 SAS)", categoria: "Aseo", valor: 10100 },
    ]
  },
  {
    date: "2026-06-10", total: 189470,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "Faltante tarjetas (ajuste)", categoria: "Servicios financieros", valor: 1470 },
      { concepto: "Hierbabuena, romero, uva, mango (cta. cobro Sala + domicilio)", categoria: "Insumos coctelería", valor: 37000 },
      { concepto: "Whisky coctelería (Catay Market)", categoria: "Insumos coctelería", valor: 84000 },
      { concepto: "Globos (ambientación Mundial)", categoria: "Decoración", valor: 35000 },
      { concepto: "D1 - toalla cocina + pastillas", categoria: "Aseo", valor: 27000 },
    ]
  },
  {
    date: "2026-06-11", total: 40500,
    items: [
      { concepto: "Gastos varios del día (sin foto de desglose - tomado de la línea GASTOS del cuadre)", categoria: "Varios", valor: 40500, nota: "Pendiente foto de desglose para clasificar" },
    ]
  },
  {
    date: "2026-06-12", total: 34300,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
      { concepto: "Ganchos adhesivos", categoria: "Insumos varios", valor: 3000 },
      { concepto: "Desengrasante + limpiavidrios + toalla cocina (D1)", categoria: "Aseo", valor: 21300 },
    ]
  },
  {
    date: "2026-06-13", total: 106600,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
      { concepto: "Galería (frutas/insumos plaza de mercado)", categoria: "Insumos coctelería", valor: 45000 },
      { concepto: "Supermercado D1 (insumos varios)", categoria: "Insumos varios", valor: 51600 },
    ]
  },
  {
    date: "2026-06-14", total: 89520,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "Palillos", categoria: "Insumos varios", valor: 3000 },
      { concepto: "Transpak frozen (insumos granizado/frozen)", categoria: "Insumos coctelería", valor: 30000 },
      { concepto: "Reserva decoración", categoria: "Decoración", valor: 50000 },
      { concepto: "Faltante tarjeta (ajuste)", categoria: "Servicios financieros", valor: 1520 },
    ]
  },
  {
    date: "2026-06-15", total: 78600,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "Faltante tarjetas (ajuste)", categoria: "Servicios financieros", valor: 31800 },
      { concepto: "Galería (hierbabuena, romero, uva pasa, fresa, naranja, empaque - cta. cobro #7)", categoria: "Insumos coctelería", valor: 41800 },
    ]
  },
  {
    date: "2026-06-16", total: 120000,
    items: [
      { concepto: "Comida (almuerzo personal)", categoria: "Comida", valor: 5000 },
      { concepto: "D1 - insumos aseo y cocina (naranja, refresco, sal, limpiadores, toallas, paños, servilletas, azúcar, gomas, pastillas baño)", categoria: "Aseo e insumos", valor: 115000, nota: "Factura D1 SAS; pago efectivo $150.000, cambio $35.000" },
    ]
  },
  {
    date: "2026-06-17", total: 506700,
    items: [
      { concepto: "Comida (almuerzo personal)", categoria: "Comida", valor: 5000 },
      { concepto: "Canasta soda (reposición ~30 gaseosas)", categoria: "Proveedor reposición", valor: 64000, nota: "Entró a inventario: Gaseosa +30 (88->95 neto)" },
      { concepto: "Faltante cervezas (pérdida de inventario)", categoria: "Faltante inventario", valor: 40300, nota: "Explica el desfase item-level cerveza del bar esta noche" },
      { concepto: "3 Botellas caucano (GIR F1JC89606)", categoria: "Proveedor licores", valor: 128700, nota: "Aguardiente Caucano Trad Bot 750cc x3 @42900. Entró a inventario." },
      { concepto: "12 Tónicas Schweppes (GIR F1JC89472)", categoria: "Proveedor reposición", valor: 28800, nota: "Tónica 300cc x12 @2400. Entró a inventario: Agua Tónica +12 (resuelve el -2)." },
      { concepto: "3 Botellas caucano (GIR F1JC89579)", categoria: "Proveedor licores", valor: 128700, nota: "Aguardiente Caucano Trad Bot 750cc x3 @42900. Entró a inventario." },
      { concepto: "8 Red Bull (GIR F1JC89580)", categoria: "Proveedor reposición", valor: 51200, nota: "Energy Red Bull lata 750cc x8 @6400 (T.C. Mastercard/Visa). Entró a inventario: Red Bull +8." },
      { concepto: "10 Bolsas de hielo (Carantanta FVCA9444)", categoria: "Insumos hielo", valor: 60000, nota: "FLAG: factura muestra 10 bolsas @5500 = $55.000; gasto registrado $60.000 ($5.000 de diferencia por verificar)." },
    ]
  },
  {
    date: "2026-06-18", total: 5000,
    items: [
      { concepto: "Comida (almuerzo personal)", categoria: "Comida", valor: 5000 },
    ]
  },
  {
    date: "2026-06-19", total: 10000,
    items: [
      { concepto: "Gastos del día (detalle no fotografiado)", categoria: "Varios", valor: 10000, nota: "FLAG: solo llegó el total del cuadre ($10.000), sin tirilla/nota de desglose. Probable comida + insumo menor. Por confirmar." },
    ]
  },
  {
    date: "2026-06-20", total: 615600,
    items: [
      { concepto: "Comida (almuerzo personal)", categoria: "Comida", valor: 10000 },
      { concepto: "Cinta ancha", categoria: "Insumos", valor: 3000 },
      { concepto: "Jugo del Valle", categoria: "Insumos", valor: 5000 },
      { concepto: "Globos y decoración (globos dorados, estrellas, platos desechables, velas)", categoria: "Eventos/Decoración", valor: 60000, nota: "Gasto de fiesta/evento del día" },
      { concepto: "Publicidad Búnker (4 K Frozen Granizado cortesía - fact A-017260)", categoria: "Publicidad", valor: 100000, nota: "FLAG: 4 granizados cortesía para promoción El Búnker. Es gasto de publicidad/cortesía, no venta. Empuja el neto del día a negativo." },
      { concepto: "Bold - tarjetas/datafono", categoria: "Equipos/Servicios", valor: 400000, nota: "FLAG: $400.000 a Bold (procesador de tarjetas). Probable compra de equipo/datafono (CAPEX) o cargo Bold. No recurrente - empuja el neto del día a negativo. Por confirmar naturaleza." },
      { concepto: "Compras D1 (fresa congelada, manzana royal, gomas, azúcar, mermelada - fact H6Z9461680)", categoria: "Insumos cocina/coctelería", valor: 37600, nota: "Factura D1 SAS 19 jun, pago efectivo $50.000 cambio $12.400" },
    ]
  },
  {
    date: "2026-06-22", total: 6240,
    items: [
      { concepto: "Comida (almuerzo personal)", categoria: "Comida", valor: 5000 },
      { concepto: "Faltante tarjeta", categoria: "Faltante", valor: 1240 },
    ]
  },
  {
    date: "2026-06-23", total: 150320,
    items: [
      { concepto: "Comida (almuerzo personal)", categoria: "Comida", valor: 5000 },
      { concepto: "Nómina Gustavo y Gabriela (lunes 22 jun: 65.000 + 65.000)", categoria: "Nómina", valor: 130000, nota: "Pago nómina del 22 registrado como gasto del 23" },
      { concepto: "Luz/bombillo baño (Todo Eléctrico FVE 36916)", categoria: "Mantenimiento", valor: 12800, nota: "LIMEK incrustar tradicional 12W blanca redonda" },
      { concepto: "Faltante Bold", categoria: "Faltante", valor: 2520 },
    ]
  },
  {
    date: "2026-06-24", total: 262200,
    items: [
      { concepto: "Comida (almuerzo personal)", categoria: "Comida", valor: 5000 },
      { concepto: "10 bolsas de hielo (Carantanta COT541)", categoria: "Insumos hielo", valor: 60000, nota: "FLAG: factura Carantanta $55.000 (10 @ 5.500) vs gasto $60.000 -> brecha $5.000 RECURRENTE (igual que 17 jun)" },
      { concepto: "Nómina Martes 16 jun", categoria: "Nómina", valor: 185000, nota: "FLAG DOBLE CONTEO: este mismo $185.000 (nómina martes 16) aparece también en el campo NÓMINA del cuadre. Si es el mismo pago duplicado, el neto real sería +48.480 (no -136.520). VERIFICAR con Juanma." },
      { concepto: "Mermelada piña + guantes (El Nana FVE42296)", categoria: "Insumos cocina", valor: 12200, nota: "Mermelada piña 6.500 + guante doméstico 5.700" },
    ]
  },
  {
    date: "2026-06-25", total: 5000,
    items: [
      { concepto: "Comida (almuerzo personal)", categoria: "Comida", valor: 5000 },
    ]
  },
  {
    date: "2026-06-26", total: 10000,
    items: [
      { concepto: "Gastos del día (sin desglose fotografiado)", categoria: "Varios", valor: 10000, nota: "FLAG: $10.000 en el cuadre sin foto de soporte - pedir desglose" },
    ]
  },
  {
    date: "2026-06-27", total: 10000,
    items: [
      { concepto: "Gastos del día (sin desglose fotografiado)", categoria: "Varios", valor: 10000, nota: "FLAG: $10.000 sin foto de soporte (igual que 19 y 26 jun)" },
    ]
  },
  {
    date: "2026-06-28", total: 6200,
    items: [
      { concepto: "Gastos del día (sin desglose fotografiado)", categoria: "Varios", valor: 6200, nota: "FLAG: $6.200 sin foto de soporte (probable comida + faltante)" },
    ]
  },
  {
    date: "2026-06-29", total: 86000,
    items: [
      { concepto: "Comida (almuerzo personal)", categoria: "Comida", valor: 5000 },
      { concepto: "2 bases decoración (Carantanta)", categoria: "Decoración/Mantenimiento", valor: 20000 },
      { concepto: "10 bolsas de hielo (Carantanta FVCA10282)", categoria: "Insumos hielo", valor: 61000, nota: "FLAG: factura $55.000 (10 @ 5.500) vs gasto $61.000 -> brecha $6.000 (recurrente, ya pasó 17, 24)" },
    ]
  },
  {
    date: "2026-06-30", total: 67600,
    items: [
      { concepto: "Comida (almuerzo personal)", categoria: "Comida", valor: 5000 },
      { concepto: "Faltante tarjeta", categoria: "Faltante", valor: 2600 },
      { concepto: "Turno pasado (28 jun)", categoria: "Nómina", valor: 60000, nota: "Pago de turno del domingo 28 registrado como gasto del 30" },
    ]
  },
  {
    date: "2026-07-01", total: 71500,
    items: [
      { concepto: "Nómina Gabriela (turno domingo 28 jun)", categoria: "Nómina", valor: 60000, nota: "FLAG posible duplicado: el 30-jun ya cargó 'Turno pasado (28 jun)' $60k. Confirmar si son dos personas distintas del 28 o el mismo pago duplicado." },
      { concepto: "Cinta doble faz", categoria: "Insumos varios", valor: 6500 },
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
    ]
  },
  {
    date: "2026-07-02", total: 68600,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 68600, nota: "FLAG: pendiente desglose. El cuadre cierra en 0 con gastos $68.600." },
    ]
  },
  {
    date: "2026-07-03", total: 105900,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 105900, nota: "FLAG: pendiente desglose. El cuadre cierra en 0 con gastos $105.900." },
    ]
  },
  {
    date: "2026-07-04", total: 10000,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 10000, nota: "Monto bajo; pendiente desglose." },
    ]
  },
  {
    date: "2026-07-05", total: 12000,
    items: [
      { concepto: "Dulce frutas rellenas x100 (Dollarcity, factura FBA1-138248)", categoria: "Insumos varios", valor: 7000 },
      { concepto: "Comida (almuerzo personal)", categoria: "Comida", valor: 5000 },
    ]
  },
  {
    date: "2026-07-06", total: 5000,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 5000, nota: "Monto bajo; pendiente desglose." },
    ]
  },
  {
    date: "2026-07-07", total: 69650,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 69650, nota: "FLAG: pendiente desglose. El cuadre cierra en 0 con gastos $69.650." },
    ]
  },
  {
    date: "2026-07-08", total: 5000,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 5000, nota: "Monto bajo; pendiente desglose." },
    ]
  },
  {
    date: "2026-07-09", total: 5000,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 5000, nota: "Monto bajo; pendiente desglose." },
    ]
  },
  {
    date: "2026-07-10", total: 10000,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 10000, nota: "Monto bajo; pendiente desglose." },
    ]
  },
  {
    date: "2026-07-11", total: 83750,
    items: [
      { concepto: "Fruta galería (Cta. cobro #52: hierbabuena $10.000, romero $5.000, caléndula $2.000, piña $5.000, frutos varios $15.000)", categoria: "Insumos coctelería", valor: 37000, nota: "Cuenta de cobro fechada 10/07/2026, pagada el 11" },
      { concepto: "Compras D1 (factura H6Z9473560: azúcar blanca, gomas surtidas x3, bolsas, moritas, naranja)", categoria: "Insumos varios", valor: 36750 },
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
    ]
  },
  {
    date: "2026-07-12", total: 5000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
      { concepto: "NOTA: faltante de tarjeta $3.420 anotado por caja pero NO registrado en el POS (cuadre imprime faltante $0 y gastos $5.000). Nota manuscrita suma $8.420. Verificar.", categoria: "Nota (no contabilizado)", valor: 0 },
    ]
  },
  {
    date: "2026-07-13", total: 78000,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 78000, nota: "FLAG: pendiente desglose. El cuadre cierra en 0 con gastos $78.000." },
    ]
  },
  {
    date: "2026-07-14", total: 5000,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 5000, nota: "Monto bajo; pendiente desglose." },
    ]
  },
  {
    date: "2026-07-15", total: 44000,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 44000, nota: "FLAG: pendiente desglose. El cuadre cierra en 0 con gastos $44.000." },
    ]
  },
  {
    date: "2026-07-16", total: 31000,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 31000, nota: "FLAG: pendiente desglose. El cuadre cierra en 0 con gastos $31.000." },
    ]
  },
  {
    date: "2026-07-17", total: 10000,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 10000, nota: "Monto bajo; pendiente desglose." },
    ]
  },
  {
    date: "2026-07-18", total: 161250,
    items: [
      { concepto: "Compras D1", categoria: "Insumos varios", valor: 55600 },
      { concepto: "Hielo", categoria: "Insumos varios", valor: 39600 },
      { concepto: "Compras Russo", categoria: "Insumos varios", valor: 36400 },
      { concepto: "Comida empleados", categoria: "Comida", valor: 10000 },
      { concepto: "Limpido (Russo)", categoria: "Aseo", valor: 7350 },
      { concepto: "2 coronitas publicidad El Búnker", categoria: "Publicidad", valor: 7000, nota: "Gasto de El Búnker pagado desde La Sala" },
      { concepto: "Faltante de tarjeta", categoria: "Faltante", valor: 5300 },
    ]
  },
  {
    date: "2026-07-19", total: 5000,
    items: [
      { concepto: "Comida empleados", categoria: "Comida", valor: 5000 },
    ]
  },
  {
    date: "2026-07-20", total: 179750,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 179750, nota: "FLAG: monto alto sin desglose. El cuadre cierra en 0 con gastos $179.750." },
    ]
  },
  {
    date: "2026-07-21", total: 31360,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 31360, nota: "FLAG: pendiente desglose. El cuadre cierra en 0 con gastos $31.360." },
    ]
  },
  {
    date: "2026-07-22", total: 5000,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 5000, nota: "Monto menor. El cuadre cierra en 0 con gastos $5.000." },
    ]
  },
  {
    date: "2026-07-23", total: 5000,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 5000, nota: "Monto menor. El cuadre cierra en 0 con gastos $5.000." },
    ]
  },
  {
    date: "2026-07-24", total: 114260,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 114260, nota: "FLAG: monto alto sin desglose. El cuadre cierra en 0 con gastos $114.260 + nómina $260.000." },
    ]
  },
  {
    date: "2026-07-25", total: 98120,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 98120, nota: "FLAG: pendiente desglose. Día de gran reposición de inventario (Nacional +24, Gaseosa +60, licores varios) — verificar si estos gastos corresponden a esa compra o si fue por transferencia." },
    ]
  },
  {
    date: "2026-07-26", total: 40650,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 40650, nota: "FLAG: pendiente desglose. El cuadre cierra en 0 con gastos $40.650 y nómina $0." },
    ]
  },
  {
    date: "2026-07-27", total: 57250,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 57250, nota: "FLAG: pendiente desglose. Junto con nómina $125.000 dejan el neto del día en $12.510 (5,7%). Toda la venta entró en efectivo (tarjeta $0)." },
    ]
  },
  {
    date: "2026-07-28", total: 20480,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 20480, nota: "Monto menor. El cuadre cierra en 0 con gastos $20.480 y nómina $60.000." },
    ]
  },
  {
    date: "2026-07-29", total: 20840,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 20840, nota: "Monto menor. Nómina POS $0 — la nómina de estos días se paga por transferencia (ver PRELOADED_GASTOS_TRANSFERENCIA)." },
    ]
  },
  {
    date: "2026-07-30", total: 31000,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 31000, nota: "Monto menor. El cuadre cierra en 0 con gastos $31.000 y nómina $125.000 en caja." },
    ]
  },
  {
    date: "2026-07-31", total: 592000,
    items: [
      { concepto: "3 turnos miércoles (nómina retroactiva 29-jul)", categoria: "Nómina", valor: 185000, nota: "🚩 El cuadre del 29-jul registra NÓMINA $0 en POS. Este es el costo real de ese día, pagado el viernes 31 desde caja. El neto del 29-jul ($658.370) está sobrestimado en $185.000." },
      { concepto: "2 canastas de soda + 1 paca de agua", categoria: "Reposición inventario", valor: 147000, nota: "Compra de stock, no gasto consumido. Corresponde a la reposición Gaseosa +60 / Agua +24 registrada el 30-jul." },
      { concepto: "2 turnos martes (nómina retroactiva 28-jul)", categoria: "Nómina", valor: 125000, nota: "El 28-jul ya registró $60.000 de nómina en POS; estos $125.000 son turnos adicionales del mismo día pagados el 31." },
      { concepto: "3 libras de coco", categoria: "Insumos coctelería", valor: 65000, nota: "Insumo para limonadas de coco y cocteles" },
      { concepto: "1 turno jueves (nómina retroactiva 30-jul)", categoria: "Nómina", valor: 60000, nota: "El 30-jul ya registró $125.000 de nómina en POS; este turno adicional se pagó el 31." },
      { concepto: "Comida personal", categoria: "Alimentación personal", valor: 10000 },
    ]
  },
  {
    date: "2026-08-01", total: 79000,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 79000, nota: "Pendiente desglose. El cuadre cierra en 0 con gastos $79.000 y nómina $197.500." },
    ]
  },
  {
    date: "2026-08-02", total: 113950,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 113950, nota: "🚩 Pendiente desglose. Nómina POS $0 este día: verificar si parte de estos $113.950 corresponde a turnos del domingo, como ocurrió el 31-jul." },
    ]
  },
  {
    date: "2026-08-03", total: 160000,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 160000, nota: "🚩 PRIORITARIO: estos $160.000 son la causa directa de que el día cierre en pérdida (−$108.280) con una venta de $162.600. Nómina POS $0 — muy probablemente incluyen turnos. Pedir la relación." },
    ]
  },
  {
    date: "2026-08-04", total: 138400,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 138400, nota: "Pendiente desglose. Nómina POS de solo $15.000 en un día de 36 cócteles — verificar si estos gastos incluyen turnos de bar." },
    ]
  },
  {
    date: "2026-08-05", total: 5000,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 5000, nota: "Monto menor. Este día la nómina sí se registró en su campo ($185.000)." },
    ]
  },
  {
    date: "2026-08-06", total: 116300,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 116300, nota: "Pendiente desglose. Nómina del día sí registrada en su campo ($200.000)." },
    ]
  },
  {
    date: "2026-08-07", total: 31400,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 31400, nota: "Monto menor." },
    ]
  },
  {
    date: "2026-08-08", total: 436580,
    items: [
      { concepto: "Gastos del día (sin itemizar — foto de gastos no aportada)", categoria: "Por itemizar", valor: 436580, nota: "🚩 EL GASTO DIARIO MÁS ALTO DE AGOSTO. Coincide con la gran reposición del día (Corona +24, Nacional +12, Gaseosa +24, Tónica +6, Tequila botella +4, aguardientes, vino, whisky coctelería) — probable que buena parte sea reposición de inventario pagada en efectivo desde caja, no gasto consumido. PEDIR DETALLE para clasificar." },
    ]
  }
];

// ─── CATÁLOGO MAESTRO DE PRECIOS (referencia: inventario_la_sala_para_Claude.xlsx) ───
// Cada producto: { categoria, compra, venta, fuente, notas }
// compra=0 → producto sin facturación (verificar). venta=0 → insumo coctelería.
const CATALOG = {
  "AGT BOTLLA ANQUEÑ": {categoria:"Aguardiente",compra:47100,venta:90000,fuente:"Compra: GIR-FDJC9405-01may | Venta: CARTA",notas:"Antioqueño Trad Tapa Roja 750cc (Tapa Verde S/AZ $46.800 FDJC9356)"},
  "AGT BOTLLA CAUCA": {categoria:"Aguardiente",compra:42900,venta:90000,fuente:"Compra: GIR-FDJC10351-23may | Venta: CARTA",notas:"Caucano Trad 750cc (precio confirmado en múltiples facturas)"},
  "AGT BOTLLA REAL": {categoria:"Aguardiente",compra:42900,venta:90000,fuente:"Compra: ESTIM | Venta: CARTA",notas:"Estim. similar a Caucano (no facturado)"},
  "AGT MEDIA ANQUEÑ": {categoria:"Aguardiente",compra:26500,venta:60000,fuente:"Compra: GIR-FDJC9405-01may | Venta: CARTA",notas:"Antioqueño S/AZ Tapa Azul 375cc CAN (real)"},
  "AGT MEDIA CAUCA": {categoria:"Aguardiente",compra:22800,venta:60000,fuente:"Compra: GIR-FDJC9356-30abr | Venta: CARTA",notas:"Caucano Trad CAN 375cc (confirmado factura)"},
  "AGUA": {categoria:"Bebidas no alcohólicas",compra:1300,venta:6000,fuente:"Compra: GIR-18abr | Venta: CARTA",notas:"Cristal 600cc"},
  "AGUA TONICA": {categoria:"Bebidas no alcohólicas",compra:2300,venta:6000,fuente:"Compra: GIR-FDJC9133-24abr | Venta: CARTA",notas:"Schweppes Tónica NR 300cc (confirmado factura)"},
  "AMARETTO": {categoria:"Licores/Cócteles",compra:49900,venta:0,fuente:"Compra: GIR-FDJC010090-17may | Venta: INSUMO",notas:"Tres Plumas Amareto 700cc (precio real)"},
  "CACHAZA": {categoria:"Licores/Cócteles",compra:0,venta:0,fuente:"Compra: VERIFICAR | Venta: INSUMO",notas:"Insumo Caipirinha"},
  "CAJA DE VINO": {categoria:"Vino",compra:20650,venta:0,fuente:"Compra: GIR-FDJC9133-24abr | Venta: VERIFICAR",notas:"Vino Cata Tint T/Pack 1L (confirmado factura)"},
  "CERVEZA CORONA": {categoria:"Cerveza",compra:3800,venta:13000,fuente:"Compra: GIR-FDJC10005-15may | Venta: CARTA",notas:"Corona Bot 330cc (precio real)"},
  "CERVEZA IMPORTADA": {categoria:"Cerveza",compra:3563,venta:13000,fuente:"Compra: VERIFICAR | Venta: CARTA",notas:"No facturada en periodo"},
  "CERVEZA NACIONAL": {categoria:"Cerveza",compra:3400,venta:9000,fuente:"Compra: GIR-FDJC10005-15may | Venta: CARTA",notas:"Promedio Club C.Dorada $3.500 / Poker $3.300"},
  "CHICLETS": {categoria:"Otros",compra:6000,venta:0,fuente:"Compra: VERIFICAR | Venta: VERIFICAR",notas:""},
  "CIGARRILLOS": {categoria:"Otros",compra:0,venta:0,fuente:"Compra: VERIFICAR | Venta: VERIFICAR",notas:""},
  "CREMA DE WHISKY": {categoria:"Licores/Cócteles",compra:27100,venta:0,fuente:"Compra: GIR-FDJC10282-22may | Venta: INSUMO",notas:"Crema/Wh Jumbo 750cc (precio real confirmado factura)"},
  "CURAZAO AZUL": {categoria:"Licores/Cócteles",compra:25000,venta:0,fuente:"Compra: VERIFICAR | Venta: INSUMO",notas:"Insumo cóctel Blue Hawai/Burbujas Azules"},
  "DRY MARTINY": {categoria:"Licores/Cócteles",compra:67300,venta:0,fuente:"Compra: GIR-FDJC010090-17may | Venta: INSUMO",notas:"Martini Extra Dry 750cc (precio real)"},
  "ELECTROLIT": {categoria:"Bebidas no alcohólicas",compra:7200,venta:15000,fuente:"Compra: GIR-04abr | Venta: VERIFICAR",notas:"Suero Electrolit 625cc"},
  "SMIRNOFF ICE": {categoria:"Aperitivo",compra:5650,venta:13000,fuente:"Compra: GIR-F1JC70279-22jun | Venta: DERIVADO/VERIFICAR",notas:"Aperitivo Smirnoff Ice 275cc - PVP por confirmar con carta"},
  "SMIRNOFF GREEN APPLE": {categoria:"Aperitivo",compra:5600,venta:13000,fuente:"Compra: GIR-F1JC70279-22jun | Venta: DERIVADO/VERIFICAR",notas:"Aperitivo Smirnoff Green Apple 275cc - PVP por confirmar con carta"},
  "ENCENDEDOR": {categoria:"Otros",compra:0,venta:0,fuente:"Compra: VERIFICAR | Venta: VERIFICAR",notas:""},
  "GASEOSA": {categoria:"Bebidas no alcohólicas",compra:2400,venta:6000,fuente:"Compra: GIR-FDJC9133-24abr | Venta: CARTA",notas:"Postobón NR Soda 10oz (confirmado factura)"},
  "GASEOSA 1.5": {categoria:"Bebidas no alcohólicas",compra:5350,venta:10000,fuente:"Compra: GIR-FDJC10351-23may | Venta: CARTA",notas:"Coca-Cola NR 1.5L (precio actualizado real)"},
  "GINEBRA BOTELLA": {categoria:"Ginebra",compra:150000,venta:280000,fuente:"Compra: GIR-02abr | Venta: CARTA",notas:"Perigans 700cc (Tanqueray/Bombay $280k según marca)"},
  "GINEBRA DL": {categoria:"Ginebra",compra:20000,venta:20000,fuente:"Compra: INSUMO | Venta: CARTA",notas:"Trago doble - precio carta (Aguard/Ron)"},
  "GINEBRA ML": {categoria:"Ginebra",compra:77000,venta:0,fuente:"Compra: INSUMO | Venta: INSUMO",notas:"Insumo cóctel"},
  "LICOR CAFÉ": {categoria:"Licores/Cócteles",compra:49900,venta:0,fuente:"Compra: GIR-FDJC9133-24abr | Venta: INSUMO",notas:"Tres Plumas Café 700cc - insumo (confirmado)"},
  "LICOR DE MANZANA": {categoria:"Licores/Cócteles",compra:25000,venta:0,fuente:"Compra: VERIFICAR | Venta: INSUMO",notas:"Insumo Apple Martini"},
  "LICOR DE MENTA": {categoria:"Licores/Cócteles",compra:74400,venta:0,fuente:"Compra: GIR-FDJC10351-23may | Venta: INSUMO",notas:"Convier Menta 750cc - insumo Demonio Verde (precio confirmado)"},
  "RED BULL": {categoria:"Bebidas no alcohólicas",compra:6400,venta:15000,fuente:"Compra: VERIFICAR | Venta: CARTA",notas:"No facturado (Amper $2.900 NO es Red Bull)"},
  "RON CALDAS BOTELLA": {categoria:"Ron",compra:59300,venta:110000,fuente:"Compra: GIR-FDJC9356-30abr | Venta: CARTA",notas:"Ron V.de Caldas 750cc (precio real confirmado)"},
  "RON CALDAS MEDIA": {categoria:"Ron",compra:30700,venta:80000,fuente:"Compra: GIR-FDJC9420-01may | Venta: CARTA",notas:"Ron V.de Caldas CAN 375cc (precio real confirmado)"},
  "RON DL": {categoria:"Ron",compra:20000,venta:20000,fuente:"Compra: INSUMO | Venta: CARTA",notas:"Trago doble Ron"},
  "TEQUILA BOTELLA": {categoria:"Tequila",compra:77800,venta:195000,fuente:"Compra: GIR-FDJC10351-23may | Venta: CARTA",notas:"José Cuervo Amar 750cc $77.800 (var: Jimador $101.000, Olmeca $76.100-$84.850 - mismo grupo)"},
  "TEQUILA LITRO": {categoria:"Tequila",compra:87900,venta:110000,fuente:"Compra: GIR-02abr | Venta: VERIFICAR",notas:"Tres Caballos Gold 1L"},
  "TEQUILA MEDIA": {categoria:"Tequila",compra:43950,venta:110000,fuente:"Compra: VERIFICAR | Venta: CARTA",notas:"No facturada"},
  "TEQUILA ML": {categoria:"Tequila",compra:86000,venta:0,fuente:"Compra: INSUMO | Venta: INSUMO",notas:"Insumo cóctel"},
  "TRIPLESEC": {categoria:"Licores/Cócteles",compra:31000,venta:0,fuente:"Compra: MIL-01abr | Venta: INSUMO",notas:"Base $21.008 + impuestos prorrateados"},
  "VINO BOTELLA": {categoria:"Vino",compra:36900,venta:90000,fuente:"Compra: GIR-18abr | Venta: CARTA",notas:"Gato Negro Cab/Suav 750cc"},
  "VINO CASILLERO BOTELLA": {categoria:"Vino",compra:61700,venta:100000,fuente:"Compra: VERIFICAR | Venta: CARTA",notas:"No facturado"},
  "VODKA BOTELLA": {categoria:"Vodka",compra:89000,venta:195000,fuente:"Compra: VERIFICAR | Venta: CARTA",notas:"No facturado en periodo"},
  "VODKA MEDIA": {categoria:"Vodka",compra:54000,venta:110000,fuente:"Compra: VERIFICAR | Venta: CARTA",notas:"No facturado"},
  "VODKA DL": {categoria:"Vodka",compra:20000,venta:20000,fuente:"Compra: INSUMO | Venta: CARTA",notas:"Trago doble Vodka aprox"},
  "BUCHANAN'S BOTELLA": {categoria:"Whisky",compra:156800,venta:310000,fuente:"Compra: GIR-02abr | Venta: CARTA",notas:"Buchanans 12 años 750cc"},
  "BUCHANAN'S MEDIA": {categoria:"Whisky",compra:96000,venta:230000,fuente:"Compra: VERIFICAR | Venta: CARTA",notas:"No facturada en periodo"},
  "WHISKEY COCTELERIA": {categoria:"Whisky",compra:51600,venta:0,fuente:"Compra: GIR-FDJC10351-23may | Venta: INSUMO",notas:"Passport Scot 700cc - insumo cócteles (precio confirmado)"},
  "BALLANTINES COCTELERIA": {categoria:"Whisky",compra:83500,venta:0,fuente:"Compra: GIR-FDJC8447-02abr | Venta: INSUMO",notas:"Ballantine's Finest 1L - insumo coctelería"},
  "SOMETHING SPECIAL COCT": {categoria:"Whisky",compra:59900,venta:0,fuente:"Compra: GIR-FDJC10005-15may | Venta: INSUMO",notas:"Something Special 750cc - insumo coctelería (var. $58.800 FDJC9420)"},
  "HIELO": {categoria:"Otros",compra:4600,venta:0,fuente:"Compra: GIR-FDJC9133-24abr | Venta: INSUMO",notas:"Hielo Kolbitos 3KG - insumo coctelería"},
  "CREMA DE LECHE": {categoria:"Otros",compra:19500,venta:0,fuente:"Compra: REY-10864-19may | Venta: INSUMO",notas:"El Rey - insumo coctelería"},
  "PAQUETE DE MENTAS": {categoria:"Otros",compra:30000,venta:0,fuente:"Compra: REY-10864-19may | Venta: INSUMO",notas:"El Rey - insumo coctelería"},
  "GOTAS AMARGAS": {categoria:"Licores/Cócteles",compra:8000,venta:0,fuente:"Compra: REY-10864-19may | Venta: INSUMO",notas:"El Rey - bitter coctelería (tipo Angostura)"},
  "VODKA TAMARINDO": {categoria:"Vodka",compra:45400,venta:0,fuente:"Compra: GIR-FDJC009970-15may | Venta: INSUMO",notas:"Smirnoff Tamarindo Picante 750cc - insumo coctelería"},
  "OLD PARR BOTELLA": {categoria:"Whisky",compra:136700,venta:300000,fuente:"Compra: GIR-FDJC9420-01may | Venta: CARTA",notas:"Old Parr 12AN 750cc (precio real confirmado)"},
  "OLD PARR MEDIA": {categoria:"Whisky",compra:99800,venta:220000,fuente:"Compra: GIR-FDJC10005-15may | Venta: CARTA",notas:"Old Parr 12AN 500cc (confirmado factura)"},
};

// ─── Categorías con orden y color ───
const CATEGORIAS = [
  {nombre:"Aguardiente",color:"#7cc474"},
  {nombre:"Whisky",color:"#c9943e"},
  {nombre:"Ron",color:"#c44d3a"},
  {nombre:"Tequila",color:"#d9a05b"},
  {nombre:"Vodka",color:"#5fb3d4"},
  {nombre:"Ginebra",color:"#9d7cd0"},
  {nombre:"Vino",color:"#8b2538"},
  {nombre:"Cerveza",color:"#d4a843"},
  {nombre:"Licores/Cócteles",color:"#e07a5f"},
  {nombre:"Bebidas no alcohólicas",color:"#7fb3d5"},
  {nombre:"Otros",color:"#6c7a89"},
];

// ─── Compras registradas (facturas procesadas) ───
// Estructura: { fecha, factura, proveedor, items: [{producto_jsx, cant, base_und, icl_und, vr_und, vr_total, observaciones}] }
const PRELOADED_COMPRAS = [
  // FDJC8447 · 2026-04-02 · vence 2026-05-02 · A Pagar $167.000
  { fecha:"2026-04-02", factura:"FDJC8447", proveedor:"GIR (Licores Junior)", vence:"2026-05-02", a_pagar:167000, items:[
    { producto_jsx:"BALLANTINES COCTELERIA", cant:2, base_und:47252.38, icl_und:33885, vr_und:83500, vr_total:167000, observaciones:"WHISKY BALLANT FINEST 1LIT · Nota: ya llevo" },
  ]},
  // FDJC8961 · 2026-04-18 · vence 2026-05-18 · A Pagar $340.900 (CANCELADA 26 may pago combinado Davivienda $1.348.500)
  { fecha:"2026-04-18", factura:"FDJC8961", proveedor:"GIR (Licores Junior)", vence:"2026-05-18", a_pagar:340900, items:[
    { producto_jsx:"VINO BOTELLA", cant:2, base_und:25836.19, icl_und:9772, vr_und:36900, vr_total:73800, observaciones:"VINO GATO NEGRO CAB/SUAV BOT 750CC" },
    { producto_jsx:"OLD PARR MEDIA", cant:1, base_und:69257.14, icl_und:27080, vr_und:99800, vr_total:99800, observaciones:"WHISKY OLD PARR 12AN UND 500CC" },
    { producto_jsx:"CREMA DE WHISKY", cant:1, base_und:55399.05, icl_und:20331, vr_und:78500, vr_total:78500, observaciones:"CREMA/WH BAILEYS BOT 700CC (insumo coctelería premium)" },
    { producto_jsx:"AGUA", cant:24, base_und:1300, icl_und:0, vr_und:1300, vr_total:31200, observaciones:"AGUA CRISTAL NORMAL UND 600CC" },
    { producto_jsx:"GASEOSA", cant:24, base_und:2400, icl_und:0, vr_und:2400, vr_total:57600, observaciones:"GASEO POSTOBON NR SODA 10OZ" },
  ]},
  // FDJC9133 · 2026-04-24 · vence 2026-05-24 · A Pagar $484.500 (valor confirmado por usuario)
  { fecha:"2026-04-24", factura:"FDJC9133", proveedor:"GIR (Licores Junior)", vence:"2026-05-24", a_pagar:485500, items:[
    { producto_jsx:"HIELO", cant:10, base_und:4600, icl_und:0, vr_und:4600, vr_total:46000, observaciones:"HIELO KOLBITOS 3KG" },
    { producto_jsx:"GASEOSA", cant:48, base_und:2400, icl_und:0, vr_und:2400, vr_total:115200, observaciones:"GASEO POSTOBON NR SODA 10OZ" },
    { producto_jsx:"AGT BOTLLA CAUCA", cant:2, base_und:24907.62, icl_und:16747, vr_und:42900, vr_total:85800, observaciones:"AGUARD CAUCANO TRAD BOT 750CC" },
    { producto_jsx:"GASEOSA 1.5", cant:2, base_und:4117.65, icl_und:0, vr_und:4900, vr_total:9800, observaciones:"JUGO DEL VALLE CITRUS 1.5LIT" },
    { producto_jsx:"WHISKEY COCTELERIA", cant:1, base_und:28846.67, icl_und:21311, vr_und:51600, vr_total:51600, observaciones:"WHISKY PASSPORT SCOT BOT 700CC" },
    { producto_jsx:"LICOR DE MENTA", cant:1, base_und:52542.86, icl_und:19230, vr_und:74400, vr_total:74400, observaciones:"LICOR CONVIER MENTA BOT 750CC" },
    { producto_jsx:"LICOR CAFÉ", cant:1, base_und:30285.71, icl_und:18100, vr_und:49900, vr_total:49900, observaciones:"LICOR TRES PLUMAS CAFE BOT 700CC" },
    { producto_jsx:"AGUA TONICA", cant:5, base_und:1932.77, icl_und:0, vr_und:2300, vr_total:11500, observaciones:"GASEO SCHWEPPES TONICA NR 300CC" },
    { producto_jsx:"CAJA DE VINO", cant:2, base_und:13440.95, icl_und:6537, vr_und:20650, vr_total:41300, observaciones:"VINO CATA TINT T/PACK 1LIT" },
  ]},
  // FDJC9356 · 2026-04-30 · vence 2026-05-30 · A Pagar $522.500
  { fecha:"2026-04-30", factura:"FDJC9356", proveedor:"GIR (Licores Junior)", vence:"2026-05-30", a_pagar:522500, items:[
    { producto_jsx:"GASEOSA 1.5", cant:12, base_und:4495.8, icl_und:0, vr_und:5350, vr_total:64200, observaciones:"GASEO COC/COLA NR 1.5LIT (Coca-Cola 1.5L $5.350)" },
    { producto_jsx:"AGT BOTLLA ANQUEÑ", cant:4, base_und:29327.62, icl_und:16006, vr_und:46800, vr_total:187200, observaciones:"AGUARD ANTIOQUENO S/AZ 24° TAPA VERDE 750CC" },
    { producto_jsx:"AGT MEDIA CAUCA", cant:3, base_und:13725.71, icl_und:8388, vr_und:22800, vr_total:68400, observaciones:"AGUARD CAUCANO TRAD CAN 375CC" },
    { producto_jsx:"RON CALDAS BOTELLA", cant:2, base_und:35487.62, icl_und:22038, vr_und:59300, vr_total:118600, observaciones:"RON V.DE CALDAS BOT 750CC" },
    { producto_jsx:"TEQUILA BOTELLA", cant:1, base_und:42722.07, icl_und:29041.83, vr_und:73900, vr_total:73900, observaciones:"TEQUILA JOSE CUERVO AMAR BOT 750CC" },
    { producto_jsx:"GASEOSA 1.5", cant:2, base_und:4117.65, icl_und:0, vr_und:4900, vr_total:9800, observaciones:"JUGO DEL VALLE CITRUS 1.5LIT" },
    { producto_jsx:"", cant:1, base_und:400, icl_und:0, vr_und:400, vr_total:400, observaciones:"Ajuste valor real factura: items suman $522.100 vs valor confirmado $522.500 (pendiente identificar línea)" },
  ]},
  // FDJC9405 · 2026-05-01 · vence 2026-05-31 · A Pagar $194.300
  { fecha:"2026-05-01", factura:"FDJC9405", proveedor:"GIR (Licores Junior)", vence:"2026-05-31", a_pagar:194300, items:[
    { producto_jsx:"AGT BOTLLA ANQUEÑ", cant:3, base_und:27617.14, icl_und:18102, vr_und:47100, vr_total:141300, observaciones:"AGUARD ANTIOQUENO TRAD 29° TAPA ROJA 750CC · Nota: La Sala ya llevo" },
    { producto_jsx:"AGT MEDIA ANQUEÑ", cant:2, base_und:16271.43, icl_und:9415, vr_und:26500, vr_total:53000, observaciones:"AGUARD ANTIOQUENO S/AZ 29° TAPA AZUL 375CC" },
  ]},
  // FDJC9420 · 2026-05-01 · vence 2026-05-31 · A Pagar $256.900
  { fecha:"2026-05-01", factura:"FDJC9420", proveedor:"GIR (Licores Junior)", vence:"2026-05-31", a_pagar:256900, items:[
    { producto_jsx:"RON CALDAS MEDIA", cant:2, base_und:18743.81, icl_und:11019, vr_und:30700, vr_total:61400, observaciones:"RON V.DE CALDAS CAN 375CC" },
    { producto_jsx:"OLD PARR BOTELLA", cant:1, base_und:90360.95, icl_und:41821, vr_und:136700, vr_total:136700, observaciones:"WHISKY OLD PARR 12AN BOT 750CC" },
    { producto_jsx:"SOMETHING SPECIAL COCT", cant:1, base_und:31522.86, icl_und:25701, vr_und:58800, vr_total:58800, observaciones:"WHISKY SOMET/SPEC 750CC OFE" },
  ]},
  // FDJC10005 · 2026-05-15 · vence 2026-06-14 · A Pagar $319.000
  { fecha:"2026-05-15", factura:"FDJC10005", proveedor:"GIR (Licores Junior)", vence:"2026-06-14", a_pagar:319000, items:[
    { producto_jsx:"OLD PARR MEDIA", cant:1, base_und:69257.14, icl_und:27080, vr_und:99800, vr_total:99800, observaciones:"WHISKY OLD PARR 12AN 500CC" },
    { producto_jsx:"AGT MEDIA ANQUEÑ", cant:1, base_und:16271.43, icl_und:9415, vr_und:26500, vr_total:26500, observaciones:"AGUARD ANTIOQUENO S/AZ 29° TAPA AZUL 375CC" },
    { producto_jsx:"AGT MEDIA ANQUEÑ", cant:1, base_und:15570.48, icl_und:9051, vr_und:25400, vr_total:25400, observaciones:"AGUARD ANTIOQUENO TRAD 29° TAPA ROJA 375CC" },
    { producto_jsx:"SOMETHING SPECIAL COCT", cant:1, base_und:34300, icl_und:23885, vr_und:59900, vr_total:59900, observaciones:"WHISKY SOMET/SPEC 750CC OFE" },
    { producto_jsx:"CERVEZA CORONA", cant:12, base_und:2898.82, icl_und:350.4, vr_und:3800, vr_total:45600, observaciones:"CERV CORONA BOT 330CC" },
    { producto_jsx:"CERVEZA NACIONAL", cant:12, base_und:2497.48, icl_und:528, vr_und:3500, vr_total:42000, observaciones:"CERV CLUB C. DORADA LAT 330CC" },
    { producto_jsx:"CERVEZA NACIONAL", cant:6, base_und:2297.14, icl_und:566.4, vr_und:3300, vr_total:19800, observaciones:"CERV POKER LAT 330CC" },
  ]},
  // BAV-PICKING-01may · 2026-05-01 · Lista Picking Bavaria · Total $480.400 (relacionada y cancelada vía transferencia)
  { fecha:"2026-05-01", factura:"BAV-PICKING-01may", proveedor:"Bavaria", vence:"2026-05-01", a_pagar:480400, items:[
    { producto_jsx:"CERVEZA NACIONAL", cant:1, base_und:63900, icl_und:0, vr_und:63900, vr_total:63900, observaciones:"PK Rb330X30 · Poker caja x30 retornable (~$2.130/bot)" },
    { producto_jsx:"CERVEZA NACIONAL", cant:1, base_und:66500, icl_und:0, vr_und:66500, vr_total:66500, observaciones:"AG Rb330X30 · Águila caja x30 retornable (~$2.217/bot)" },
    { producto_jsx:"CERVEZA NACIONAL", cant:2, base_und:86800, icl_und:0, vr_und:86800, vr_total:173600, observaciones:"CL Rb330X30N · Club Colombia caja x30 retornable (~$2.893/bot)" },
    { producto_jsx:"CERVEZA CORONA", cant:4, base_und:22225, icl_und:0, vr_und:22225, vr_total:88900, observaciones:"CORONANRB330X6 · Corona NR sixpack (~$3.704/bot)" },
    { producto_jsx:"CERVEZA IMPORTADA", cant:4, base_und:21375, icl_und:0, vr_und:21375, vr_total:85500, observaciones:"STEARTNRB300X6 · Stella Artois NR sixpack (~$3.563/bot)" },
    { producto_jsx:"", cant:1, base_und:2000, icl_und:0, vr_und:2000, vr_total:2000, observaciones:"Envases" },
  ]},
  // FDJC009970 · 2026-05-15 · vence 2026-06-14 · A Pagar $90.800 (anteriormente PD102247)
  { fecha:"2026-05-15", factura:"FDJC009970", proveedor:"GIR (Licores Junior)", vence:"2026-06-14", a_pagar:90800, items:[
    { producto_jsx:"VODKA TAMARINDO", cant:2, base_und:27175, icl_und:18225, vr_und:45400, vr_total:90800, observaciones:"VODKA SMIRNOFF TAMARINDO PICANTE 750CC (insumo coctelería)" },
  ]},
  // FDJC010090 · 2026-05-17 · vence 2026-06-16 · A Pagar $284.550 (anteriormente PD102560)
  { fecha:"2026-05-17", factura:"FDJC010090", proveedor:"GIR (Licores Junior)", vence:"2026-06-16", a_pagar:284550, items:[
    { producto_jsx:"VINO BOTELLA", cant:1, base_und:36900, icl_und:0, vr_und:36900, vr_total:36900, observaciones:"VINO GATO NEGRO CAB/SUAV BOT 750CC" },
    { producto_jsx:"CAJA DE VINO", cant:1, base_und:20650, icl_und:0, vr_und:20650, vr_total:20650, observaciones:"VINO CATA TINT T/PACK 1LIT" },
    { producto_jsx:"SOMETHING SPECIAL COCT", cant:1, base_und:59900, icl_und:0, vr_und:59900, vr_total:59900, observaciones:"WHISKY SOMET/SPEC BOT 750CC DTO (oferta)" },
    { producto_jsx:"AMARETTO", cant:1, base_und:49900, icl_und:0, vr_und:49900, vr_total:49900, observaciones:"LICOR TRES PLUMAS AMARETO BOT 700CC" },
    { producto_jsx:"LICOR CAFÉ", cant:1, base_und:49900, icl_und:0, vr_und:49900, vr_total:49900, observaciones:"LICOR TRES PLUMAS CAFE BOT 700CC" },
    { producto_jsx:"DRY MARTINY", cant:1, base_und:67300, icl_und:0, vr_und:67300, vr_total:67300, observaciones:"LICOR MARTINI EXTRA DRY BOT 750CC" },
  ]},
  // REY-10864 · 2026-05-19 · Distribuidora El Rey · A Pagar $155.000 (crédito)
  { fecha:"2026-05-19", factura:"REY-10864", proveedor:"Distribuidora El Rey", vence:"2026-06-18", a_pagar:155000, items:[
    { producto_jsx:"CREMA DE LECHE", cant:6, base_und:19500, icl_und:0, vr_und:19500, vr_total:117000, observaciones:"6 Crema de Leche (insumo coctelería)" },
    { producto_jsx:"PAQUETE DE MENTAS", cant:1, base_und:30000, icl_und:0, vr_und:30000, vr_total:30000, observaciones:"1 Paquete de Mentas" },
    { producto_jsx:"GOTAS AMARGAS", cant:1, base_und:8000, icl_und:0, vr_und:8000, vr_total:8000, observaciones:"1 Gotas Amargas (tipo Angostura)" },
  ]},
  // CC-00001 · 2026-05-20 · Coca-Cola Soporte de Entrega · A Pagar $153.800 (cancelada — pagada vía transferencia 21 may)
  { fecha:"2026-05-20", factura:"CC-00001", proveedor:"Coca-Cola", vence:"2026-05-20", a_pagar:153800, items:[
    { producto_jsx:"GASEOSA", cant:1, base_und:55360, icl_und:7140, vr_und:62500, vr_total:62500, observaciones:"COCA-COLA 350ML VIR · 1 caja x 30 botellas retornables (~$2.083/bot)" },
    { producto_jsx:"AGUA TONICA", cant:1, base_und:26352, icl_und:2448, vr_und:28800, vr_total:28800, observaciones:"SCHWEPPES TONICA 10oz VNR · 1 caja x 12 botellas (~$2.400/bot)" },
    { producto_jsx:"GASEOSA", cant:1, base_und:62500, icl_und:0, vr_und:62500, vr_total:62500, observaciones:"COCA-COLA ZERO 350ML VR(30) KZ · 1 caja x 30 botellas retornables (~$2.083/bot)" },
  ]},
  // H7Z1136639 · 2026-05-21 · D1 SAS · A Pagar $58.350 (cancelada — pagada en contado tarjeta)
  { fecha:"2026-05-21", factura:"H7Z1136639", proveedor:"D1", vence:"2026-05-21", a_pagar:58350, items:[
    { producto_jsx:"", cant:2, base_und:3800, icl_und:0, vr_und:3800, vr_total:7600, observaciones:"Jugo del Valle (insumo varios)" },
    { producto_jsx:"", cant:1, base_und:39950, icl_und:0, vr_und:39950, vr_total:39950, observaciones:"Whisky Escocés (compra emergencia — sin cruce al catálogo)" },
    { producto_jsx:"", cant:3, base_und:3600, icl_und:0, vr_und:3600, vr_total:10800, observaciones:"3 paquetes Gomas Surtidas (insumo varios)" },
  ]},
  // FRUTA-21may · 2026-05-21 · Proveedor Frutas (cuenta de cobro) · A Pagar $153.000 (cancelada — pagada vía transferencia)
  { fecha:"2026-05-21", factura:"FRUTA-21may", proveedor:"Proveedor Frutas", vence:"2026-05-21", a_pagar:153000, items:[
    { producto_jsx:"", cant:1, base_und:5000, icl_und:0, vr_und:5000, vr_total:5000, observaciones:"Romero (insumo coctelería)" },
    { producto_jsx:"", cant:1, base_und:8000, icl_und:0, vr_und:8000, vr_total:8000, observaciones:"Yerbabuena (insumo coctelería)" },
    { producto_jsx:"", cant:1, base_und:5000, icl_und:0, vr_und:5000, vr_total:5000, observaciones:"Manzanas Verdes" },
    { producto_jsx:"", cant:2, base_und:5000, icl_und:0, vr_und:5000, vr_total:10000, observaciones:"Fresas (2)" },
    { producto_jsx:"", cant:3, base_und:5000, icl_und:0, vr_und:5000, vr_total:15000, observaciones:"Mora (3)" },
    { producto_jsx:"", cant:2, base_und:8000, icl_und:0, vr_und:8000, vr_total:16000, observaciones:"Guanábana (2)" },
    { producto_jsx:"", cant:4, base_und:5000, icl_und:0, vr_und:5000, vr_total:20000, observaciones:"Piñas (4)" },
    { producto_jsx:"", cant:2, base_und:5000, icl_und:0, vr_und:5000, vr_total:10000, observaciones:"Naranjas (2)" },
    { producto_jsx:"", cant:1, base_und:5000, icl_und:0, vr_und:5000, vr_total:5000, observaciones:"Uvas (1)" },
    { producto_jsx:"", cant:3, base_und:10000, icl_und:0, vr_und:10000, vr_total:30000, observaciones:"Maracuyá (3 libras)" },
    { producto_jsx:"", cant:3, base_und:8000, icl_und:0, vr_und:8000, vr_total:24000, observaciones:"Mango (3)" },
    { producto_jsx:"", cant:1, base_und:5000, icl_und:0, vr_und:5000, vr_total:5000, observaciones:"Domicilio" },
  ]},
  // FDJC010193 · 2026-05-21 · vence 2026-06-20 · A Pagar $169.700 (crédito 30 días) — Nota PDF: "La sala, ya llevo"
  { fecha:"2026-05-21", factura:"FDJC010193", proveedor:"GIR (Licores Junior)", vence:"2026-06-20", a_pagar:169700, items:[
    { producto_jsx:"TEQUILA BOTELLA", cant:2, base_und:55277.14, icl_und:26809, vr_und:84850, vr_total:169700, observaciones:"TEQUILA OLMECA REPOSADO BOT 700CC (premium). Nota factura: La sala, ya llevo." },
  ]},
  // FDJC010200 · 2026-05-21 · vence 2026-06-20 · A Pagar $169.700 (crédito 30 días)
  { fecha:"2026-05-21", factura:"FDJC010200", proveedor:"GIR (Licores Junior)", vence:"2026-06-20", a_pagar:169700, items:[
    { producto_jsx:"TEQUILA BOTELLA", cant:2, base_und:55277.14, icl_und:26809, vr_und:84850, vr_total:169700, observaciones:"TEQUILA OLMECA REPOSADO BOT 700CC (premium - misma referencia que FDJC010193 y FDJC10220, mismo día)" },
  ]},
  // FDJC10220 · 2026-05-21 · vence 2026-06-20 · A Pagar $169.700 (crédito 30 días)
  { fecha:"2026-05-21", factura:"FDJC10220", proveedor:"GIR (Licores Junior)", vence:"2026-06-20", a_pagar:169700, items:[
    { producto_jsx:"TEQUILA BOTELLA", cant:2, base_und:55277.14, icl_und:26809, vr_und:84850, vr_total:169700, observaciones:"TEQUILA OLMECA REPOSADO BOT 700CC (premium - tequila botella; precio variable: $76.100 en FDJC10282 vs $84.850 en FDJC10220/10193/10200)" },
  ]},
  // FDJC010234 · 2026-05-22 · vence 2026-06-21 · A Pagar $53.000 (crédito 30 días) — Nota PDF: "la sala ya llevo"
  { fecha:"2026-05-22", factura:"FDJC010234", proveedor:"GIR (Licores Junior)", vence:"2026-06-21", a_pagar:53000, items:[
    { producto_jsx:"AGT MEDIA ANQUEÑ", cant:2, base_und:16271.43, icl_und:9415, vr_und:26500, vr_total:53000, observaciones:"AGUARD ANTIOQUEÑO S/AZ 29° TAPA AZUL 375CC CAN. Nota factura: la sala ya llevo." },
  ]},
  // FDJC10282 · 2026-05-22 · vence 2026-06-21 · A Pagar $685.100 (crédito 30 días)
  { fecha:"2026-05-22", factura:"FDJC10282", proveedor:"GIR (Licores Junior)", vence:"2026-06-21", a_pagar:685100, items:[
    { producto_jsx:"CREMA DE WHISKY", cant:1, base_und:15999.05, icl_und:10301, vr_und:27100, vr_total:27100, observaciones:"CREMA/WH JUMBO BOT 750CC (Whisky Jumbo)" },
    { producto_jsx:"OLD PARR BOTELLA", cant:1, base_und:90360.95, icl_und:41821, vr_und:136700, vr_total:136700, observaciones:"WHISKY OLD PARR 12AN BOT 750CC" },
    { producto_jsx:"RON CALDAS BOTELLA", cant:1, base_und:35487.62, icl_und:22038, vr_und:59300, vr_total:59300, observaciones:"RON V.DE CALDAS BOT 750CC" },
    { producto_jsx:"RON CALDAS MEDIA", cant:2, base_und:18743.81, icl_und:11019, vr_und:30700, vr_total:61400, observaciones:"RON V.DE CALDAS CAN 375CC" },
    { producto_jsx:"TEQUILA BOTELLA", cant:1, base_und:45733.33, icl_und:29780, vr_und:77800, vr_total:77800, observaciones:"TEQUILA JOSE CUERVO AMAR BOT 750CC (precio actualizado $77.800 vs $73.900 ant.)" },
    { producto_jsx:"TEQUILA BOTELLA", cant:1, base_und:67045.48, icl_und:30602.25, vr_und:101000, vr_total:101000, observaciones:"TEQUILA JIMADOR REPOSADO BOT 700CC (premium - tequila botella)" },
    { producto_jsx:"TEQUILA BOTELLA", cant:2, base_und:46943.81, icl_und:26809, vr_und:76100, vr_total:152200, observaciones:"TEQUILA OLMECA REPOSADO BOT 700CC (premium - tequila botella)" },
    { producto_jsx:"CERVEZA NACIONAL", cant:24, base_und:1961.01, icl_und:566.4, vr_und:2900, vr_total:69600, observaciones:"CERV POKER LAT 330CC (precio $2.900/lat, var. $3.300/lat FDJC10005)" },
  ]},
  // JR-CONTADO-22may · 2026-05-22 · Compra contado Licores Junior · A Pagar $663.000 (cancelada — pagada contado)
  { fecha:"2026-05-22", factura:"JR-CONTADO-22may", proveedor:"GIR (Licores Junior)", vence:"2026-05-22", a_pagar:663000, items:[
    { producto_jsx:"", cant:1, base_und:663000, icl_und:0, vr_und:663000, vr_total:663000, observaciones:"Compra de contado (sin detalle de productos provisto) — probablemente 6 tequilas botella adicionales (entradas inventario: 10 tequilas, 4 vienen de FDJC10282; 6 de esta compra)" },
  ]},
  // CYC-POE52876 · 2026-05-23 · Cervezas y Cervezas Ltda · A Pagar $166.300 (cancelada — contado efectivo)
  { fecha:"2026-05-23", factura:"CYC-POE52876", proveedor:"Cervezas y Cervezas Ltda", vence:"2026-05-23", a_pagar:166300, items:[
    { producto_jsx:"CERVEZA NACIONAL", cant:1, base_und:53613, icl_und:10187, vr_und:63800, vr_total:63800, observaciones:"Pk bot 330x30 · Poker caja x30 botellas retornables (~$2.127/bot)" },
    { producto_jsx:"CERVEZA NACIONAL", cant:1, base_und:73529, icl_und:13971, vr_und:87500, vr_total:87500, observaciones:"Club Dr bot 330x30 · Club Colombia Dorada caja x30 retornables (~$2.917/bot)" },
    { producto_jsx:"", cant:1, base_und:15000, icl_und:0, vr_und:15000, vr_total:15000, observaciones:"Domicilio" },
  ]},
  // D1-H6Z9444970 · 2026-05-23 · D1 SAS · A Pagar $89.050 (cancelada — contado, ajuste vueltas -$30)
  { fecha:"2026-05-23", factura:"D1-H6Z9444970", proveedor:"D1", vence:"2026-05-23", a_pagar:89050, items:[
    { producto_jsx:"", cant:3, base_und:2350, icl_und:0, vr_und:2350, vr_total:7050, observaciones:"3 Servilleta CO (insumo varios)" },
    { producto_jsx:"", cant:2, base_und:5990, icl_und:0, vr_und:5990, vr_total:11980, observaciones:"2 Toalla Cocina (insumo varios)" },
    { producto_jsx:"", cant:1, base_und:10850, icl_und:0, vr_und:10850, vr_total:10850, observaciones:"1 Detergente MU (insumo aseo)" },
    { producto_jsx:"", cant:2, base_und:3800, icl_und:0, vr_und:3800, vr_total:7600, observaciones:"2 Jugo del Valle (insumo varios)" },
    { producto_jsx:"GASEOSA", cant:24, base_und:2150, icl_und:0, vr_und:2150, vr_total:51600, observaciones:"24 Soda Bretaña (gaseosas)" },
    { producto_jsx:"", cant:1, base_und:-30, icl_und:0, vr_und:-30, vr_total:-30, observaciones:"Ajuste vueltas exactas D1" },
  ]},
  // D1-H6Z9444976 · 2026-05-23 · D1 SAS · A Pagar $17.250 (cancelada — contado)
  { fecha:"2026-05-23", factura:"D1-H6Z9444976", proveedor:"D1", vence:"2026-05-23", a_pagar:17250, items:[
    { producto_jsx:"", cant:5, base_und:3450, icl_und:0, vr_und:3450, vr_total:17250, observaciones:"5 Azúcar Blanca (insumo coctelería)" },
  ]},
  // FDJC10351 · 2026-05-23 · vence 2026-06-22 · A Pagar $650.600 (crédito 30 días) — explica 6 de las 13 entradas inventario 23 may
  { fecha:"2026-05-23", factura:"FDJC10351", proveedor:"GIR (Licores Junior)", vence:"2026-06-22", a_pagar:650600, items:[
    { producto_jsx:"GASEOSA 1.5", cant:12, base_und:4495.80, icl_und:0, vr_und:5350, vr_total:64200, observaciones:"GASEO COC/COLA NR UND 1.5LIT (precio actualizado $5.350 vs $4.900 catálogo)" },
    { producto_jsx:"AGT BOTLLA CAUCA", cant:4, base_und:24907.62, icl_und:16747, vr_und:42900, vr_total:171600, observaciones:"AGUARD CAUCANO TRAD BOT 750CC (precio confirmado)" },
    { producto_jsx:"RON CALDAS BOTELLA", cant:1, base_und:35487.62, icl_und:22038, vr_und:59300, vr_total:59300, observaciones:"RON V.DE CALDAS BOT 750CC (precio confirmado)" },
    { producto_jsx:"TEQUILA BOTELLA", cant:1, base_und:45733.33, icl_und:29780, vr_und:77800, vr_total:77800, observaciones:"TEQUILA JOSE CUERVO AMAR BOT 750CC (precio confirmado)" },
    { producto_jsx:"OLD PARR BOTELLA", cant:1, base_und:90360.95, icl_und:41821, vr_und:136700, vr_total:136700, observaciones:"WHISKY OLD PARR 12AN BOT 750CC (precio confirmado)" },
    { producto_jsx:"LICOR DE MENTA", cant:1, base_und:52542.86, icl_und:19230, vr_und:74400, vr_total:74400, observaciones:"LICOR CONVIER MENTA BOT 750CC (precio confirmado)" },
    { producto_jsx:"WHISKEY COCTELERIA", cant:1, base_und:28846.67, icl_und:21311, vr_und:51600, vr_total:51600, observaciones:"WHISKY PASSPORT SCOT BOT 700CC (precio confirmado)" },
    { producto_jsx:"", cant:5, base_und:3000, icl_und:0, vr_und:3000, vr_total:15000, observaciones:"HIELO FONTE VIDA 3KGS (insumo - no en inventario)" },
  ]},
  // POSTOBON GP07444829 · 2026-05-27 · A Pagar $115.000 (cancelada — transferencia, contado)
  { fecha:"2026-05-27", factura:"GP07444829", proveedor:"Postobón", vence:"2026-05-27", a_pagar:115000, items:[
    { producto_jsx:"GASEOSA", cant:60, base_und:1916.67, icl_und:0, vr_und:1916.67, vr_total:115000, observaciones:"Bretaña 350ml Vidrio R x30 (2 cajas, 60 unidades · ~$1.917/und). Pago contado vía transferencia." },
  ]},
  // BAV-KOPPS-19186 · 2026-05-27 · KOPPS Commercial (Bavaria) Remisión F-AIO-00019186 · A Pagar $430.143 (cancelada — transferencia)
  { fecha:"2026-05-27", factura:"BAV-KOPPS-19186", proveedor:"Bavaria", vence:"2026-05-27", a_pagar:430143, items:[
    { producto_jsx:"CERVEZA NACIONAL", cant:2, base_und:58783.20, icl_und:33696, vr_und:70656.61, vr_total:156056, observaciones:"CL Rb330X30N · Club Colombia caja x30 retornable (2 cajas, neto tras dscto)" },
    { producto_jsx:"", cant:1, base_und:11155.26, icl_und:2208.64, vr_und:15483.40, vr_total:15483, observaciones:"Cajica Miel FRP (insumo)" },
    { producto_jsx:"CERVEZA CORONA", cant:4, base_und:16909.74, icl_und:8409.60, vr_und:19991.39, vr_total:79966, observaciones:"CORONANRB330 · Corona NR sixpack (4 sxp, neto tras dscto)" },
    { producto_jsx:"CERVEZA IMPORTADA", cant:4, base_und:16268.07, icl_und:8064, vr_und:18897.05, vr_total:75588, observaciones:"STEARTNRB300 · Stella Artois NR sixpack (4 sxp, neto tras dscto)" },
    { producto_jsx:"CERVEZA NACIONAL", cant:1, base_und:58504.20, icl_und:17280, vr_und:86900, vr_total:86900, observaciones:"COLTRRRB330X3 · Coronita/Club retornable caja x30" },
    { producto_jsx:"", cant:1, base_und:11496.86, icl_und:2468.74, vr_und:16150, vr_total:16150, observaciones:"BBCROSENRB33 · cerveza/bebida sixpack" },
  ]},
  // CASALIMPIA-PED1370 · 2026-05-27 · Almacén Casa Limpia Popayán · A Pagar $139.000 + $5.000 domicilio = $144.000 (cancelada — transferencia)
  { fecha:"2026-05-27", factura:"CASALIMPIA-PED1370", proveedor:"Casa Limpia", vence:"2026-05-27", a_pagar:144000, items:[
    { producto_jsx:"", cant:4, base_und:13750, icl_und:0, vr_und:13750, vr_total:55000, observaciones:"PH JUMBO NUBE BLC X ROL (papel higiénico, 4 rollos · insumo aseo)" },
    { producto_jsx:"", cant:1, base_und:69000, icl_und:0, vr_und:69000, vr_total:69000, observaciones:"LIMPIA PISOS DYILOP X UNI (insumo aseo)" },
    { producto_jsx:"", cant:1, base_und:15000, icl_und:0, vr_und:15000, vr_total:15000, observaciones:"DESMANCHADOR TAK TAX UNI (insumo aseo)" },
    { producto_jsx:"", cant:1, base_und:5000, icl_und:0, vr_und:5000, vr_total:5000, observaciones:"Domicilio Casa Limpia" },
  ]},
  // TVBASE-27may · 2026-05-27 · Instalación base TV barra (CAPEX renovación lounge) · A Pagar $200.000 (cancelada — transferencia Nequi 3105280949)
  { fecha:"2026-05-27", factura:"TVBASE-27may", proveedor:"Servicio Instalación (Nequi)", vence:"2026-05-27", a_pagar:200000, items:[
    { producto_jsx:"", cant:1, base_und:200000, icl_und:0, vr_und:200000, vr_total:200000, observaciones:"Instalación base TV en barra - La Sala. CAPEX / Activo fijo (renovación lounge). Pago Nequi comprobante G1BJ0JZWX8." },
  ]},
];

// ─── Cartera multi-proveedor — cuentas por pagar ───
// Base: estado de cuenta arcoerp GIR al 02/05/2026 (Total Cartera $3.163.900) + facturas posteriores
// de múltiples proveedores (GIR/Licores Junior, D1, Cervezas y Cervezas, Bavaria, Postobón, Frutas, etc.)
// estado: "pendiente" | "cancelada". Juanma confirma cuáles ya canceladas al 18-05-2026.
// detalle:true = factura con imagen procesada en PRELOADED_COMPRAS.
const PRELOADED_CARTERA = [
  { proveedor:"GIR (Licores Junior)", factura:"FDJC008379", fecha:"2026-04-01", vence:"2026-05-01", valor:459800, detalle:false, estado:"cancelada", nota:"Vencida al corte 02/05 (estado de cuenta). Sin imagen detallada." },
  // FDJC008440 ($356.500) RETIRADA: no pertenece a La Sala (confirmado Juanma).
  { proveedor:"GIR (Licores Junior)", factura:"FDJC008445", fecha:"2026-04-02", vence:"2026-05-02", valor:296100, detalle:false, estado:"cancelada", nota:"Sin imagen detallada." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC8447", fecha:"2026-04-02", vence:"2026-05-02", valor:167000, detalle:true, estado:"cancelada", nota:"Detalle cargado (Ballantine's Finest x2). Nota factura: ya llevo." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC008491", fecha:"2026-04-04", vence:"2026-05-04", valor:84800, detalle:false, estado:"cancelada", nota:"Sin imagen detallada." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC008961", fecha:"2026-04-18", vence:"2026-05-18", valor:340900, detalle:true, estado:"cancelada", nota:"Crédito 30 días. Detalle: 2 Vino Gato Negro, 1 Old Parr 500cc, 1 Baileys 700cc, 24 Agua Cristal 600cc, 24 Postobón Soda. CANCELADA 26 may vía Davivienda comprobante 311283 (pago combinado $1.348.500: FDJC008961+9133+9356)." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC9133", fecha:"2026-04-24", vence:"2026-05-24", valor:485500, detalle:true, estado:"cancelada", nota:"Crédito 30 días. Detalle: 10 Hielo, 48 Postobón Soda, 2 Aguard Caucano, 2 Jugo del Valle 1.5L, 1 Whisky Passport, 1 Licor Menta, 1 Licor Café, 5 Schweppes Tónica, 2 Vino Cata Tint. CANCELADA 26 may vía Davivienda comprobante 311283 (pago combinado $1.348.500)." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC9356", fecha:"2026-04-30", vence:"2026-05-30", valor:522500, detalle:true, estado:"cancelada", nota:"Crédito 30 días. Detalle: 12 Coca-Cola 1.5L, 4 Aguard Antioqueño, 3 Aguard Caucano Can, 2 Ron V.Caldas, 1 Tequila Cuervo, 2 Jugo del Valle 1.5L + ajuste +$400. CANCELADA 26 may vía Davivienda comprobante 311283 (pago combinado $1.348.500)." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC9405", fecha:"2026-05-01", vence:"2026-05-31", valor:194300, detalle:true, estado:"cancelada", nota:"Detalle cargado (2 ítems). Nota factura: La Sala ya llevo. CANCELADA 09 jun vía transferencia (estaba vencida desde 31 may)." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC9420", fecha:"2026-05-01", vence:"2026-05-31", valor:256900, detalle:true, estado:"cancelada", nota:"Detalle cargado (3 ítems). CANCELADA 09 jun vía transferencia (estaba vencida desde 31 may)." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC10005", fecha:"2026-05-15", vence:"2026-06-14", valor:319000, detalle:true, estado:"cancelada", nota:"Posterior al corte del estado de cuenta (02/05). Detalle cargado (7 ítems). CANCELADA 10 jun — Recibo de Caja RC095550 (GEG/Licores Junior), pago total $2.593.000 (9 facturas + abono FDJC10560)." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC009970", fecha:"2026-05-15", vence:"2026-06-14", valor:90800, detalle:true, estado:"cancelada", nota:"Crédito 30 días. Detalle: 2 Vodka Smirnoff Tamarindo. Nota cartera GIR: La Sala ya llevo. (Renombrado de PD102247) CANCELADA 10 jun — Recibo de Caja RC095550 (GEG/Licores Junior), pago total $2.593.000 (9 facturas + abono FDJC10560)." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC010090", fecha:"2026-05-17", vence:"2026-06-16", valor:284550, detalle:true, estado:"cancelada", nota:"Crédito 30 días. Detalle: Vino Gato Negro, Cata Tint, Somet/Spec, Amareto, Café, Martini Dry. (Renombrado de PD102560) CANCELADA 10 jun — Recibo de Caja RC095550 (GEG/Licores Junior), pago total $2.593.000 (9 facturas + abono FDJC10560)." },
  { proveedor:"Distribuidora El Rey", factura:"REY-10864", fecha:"2026-05-19", vence:"2026-06-18", valor:155000, detalle:true, estado:"cancelada", nota:"Recibo 10864 (Reinaldo López, vendedor). Insumos coctelería: 6 Crema de Leche, 1 Paquete Mentas, 1 Gotas Amargas. Plazo asumido 30 días — confirmar. CANCELADA 10 jun (pago a Distribuidora El Rey / Reinaldo, transferencia $647.000)." },
  { proveedor:"Coca-Cola", factura:"CC-00001", fecha:"2026-05-20", vence:"2026-05-20", valor:153800, detalle:true, estado:"cancelada", nota:"Soporte de Entrega 00001. 1 caja Coca-Cola 350ML + 1 caja Schweppes Tónica + 1 caja Coca-Cola Zero. Pagada vía transferencia 21 may." },
  { proveedor:"D1", factura:"H7Z1136639", fecha:"2026-05-21", vence:"2026-05-21", valor:58350, detalle:true, estado:"cancelada", nota:"Factura electrónica D1. Insumos y licor (Jugo del Valle, Whisky Escocés, Gomas). Pagada en contado tarjeta." },
  { proveedor:"Proveedor Frutas", factura:"FRUTA-21may", fecha:"2026-05-21", vence:"2026-05-21", valor:153000, detalle:true, estado:"cancelada", nota:"Cuenta de cobro frutas/hierbas + domicilio. Pagada vía transferencia 21 may." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC010193", fecha:"2026-05-21", vence:"2026-06-20", valor:169700, detalle:true, estado:"cancelada", nota:"Crédito 30 días. Detalle: 2 Tequila Olmeca Reposado 700cc. Nota factura: La sala, ya llevo. CANCELADA 10 jun — Recibo de Caja RC095550 (GEG/Licores Junior), pago total $2.593.000 (9 facturas + abono FDJC10560)." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC010200", fecha:"2026-05-21", vence:"2026-06-20", valor:169700, detalle:true, estado:"cancelada", nota:"Crédito 30 días. Detalle: 2 Tequila Olmeca Reposado 700cc (misma ref. FDJC010193/10220 mismo día). CANCELADA 10 jun — Recibo de Caja RC095550 (GEG/Licores Junior), pago total $2.593.000 (9 facturas + abono FDJC10560)." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC10220", fecha:"2026-05-21", vence:"2026-06-20", valor:169700, detalle:true, estado:"cancelada", nota:"Crédito 30 días. 2 Tequila Olmeca Reposado 700CC a $84.850 c/u (precio variable: $76.100 en FDJC10282). CANCELADA 10 jun — Recibo de Caja RC095550 (GEG/Licores Junior), pago total $2.593.000 (9 facturas + abono FDJC10560)." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC010234", fecha:"2026-05-22", vence:"2026-06-21", valor:53000, detalle:true, estado:"cancelada", nota:"Crédito 30 días. Detalle: 2 Aguardiente Antioqueño S/AZ 29° Tapa Azul 375cc CAN. Nota factura: la sala ya llevo. CANCELADA 10 jun — Recibo de Caja RC095550 (GEG/Licores Junior), pago total $2.593.000 (9 facturas + abono FDJC10560)." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC10282", fecha:"2026-05-22", vence:"2026-06-21", valor:685100, detalle:true, estado:"cancelada", nota:"Crédito 30 días. Detalle: Crema Whisky Jumbo, Old Parr, Ron Caldas (Bot+Can), 4 Tequilas botella (Cuervo+Jimador+2 Olmeca), 24 Poker. CANCELADA 10 jun — Recibo de Caja RC095550 (GEG/Licores Junior), pago total $2.593.000 (9 facturas + abono FDJC10560)." },
  { proveedor:"GIR (Licores Junior)", factura:"JR-CONTADO-22may", fecha:"2026-05-22", vence:"2026-05-22", valor:663000, detalle:false, estado:"cancelada", nota:"Compra de contado. Pagada el mismo día (probablemente 6 tequilas botella adicionales — sin detalle de productos)." },
  { proveedor:"Cervezas y Cervezas Ltda", factura:"CYC-POE52876", fecha:"2026-05-23", vence:"2026-05-23", valor:166300, detalle:true, estado:"cancelada", nota:"Factura POE52876. 1 caja Poker + 1 caja Club Colombia Dorada + domicilio $15.000. Pagada contado efectivo." },
  { proveedor:"D1", factura:"D1-H6Z9444970", fecha:"2026-05-23", vence:"2026-05-23", valor:89050, detalle:true, estado:"cancelada", nota:"D1: Insumos aseo + 2 Jugos + 24 Sodas Bretaña. Ajuste vueltas -$30. Pagada contado." },
  { proveedor:"D1", factura:"D1-H6Z9444976", fecha:"2026-05-23", vence:"2026-05-23", valor:17250, detalle:true, estado:"cancelada", nota:"D1: 5 Azúcar Blanca. Pagada contado." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC10351", fecha:"2026-05-23", vence:"2026-06-22", valor:650600, detalle:true, estado:"cancelada", nota:"Crédito 30 días. Detalle: 12 Coca-Cola 1.5L, 4 Aguard Caucano, 1 Old Parr, 1 Tequila Cuervo, 1 Ron Caldas, 1 Licor Menta, 1 Whisky Passport, 5 Hielo. Explica 6 de las 13 entradas inventario 23 may. CANCELADA 10 jun — Recibo de Caja RC095550 (GEG/Licores Junior), pago total $2.593.000 (9 facturas + abono FDJC10560)." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC10560", fecha:"2026-06-01", vence:"2026-07-01", valor:531300, detalle:false, estado:"pendiente", nota:"Factura nueva. En Recibo RC095550 (10 jun) solo recibió ABONO de $850; queda SALDO PENDIENTE de $530.450. Sin detalle de productos aún. Valor total estimado (abono + saldo)." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC11222", fecha:"2026-06-13", vence:"2026-06-13", valor:369700, detalle:true, estado:"cancelada", nota:"La Sala. CONTADO - pagada 13 jun por transferencia $369.700. Reposición que entró al inventario el 13 jun: Gaseosa Postobón 24 ($57.600), Whisky King of Queens 1 ($47.800), Vino Gato Negro 3 ($110.700), Cerveza Corona 12 ($45.000), Licor Martini Dry 1 ($67.300), Vino Cata tinto 2 ($41.300)." },
  { proveedor:"Bavaria", factura:"BAV-PICKING-01may", fecha:"2026-05-01", vence:"2026-05-01", valor:480400, detalle:true, estado:"cancelada", nota:"Lista Picking 01-may. Relacionada y cancelada vía transferencia ($480.400, 1 may)." },
  { proveedor:"Postobón", factura:"GP07444829", fecha:"2026-05-27", vence:"2026-05-27", valor:115000, detalle:true, estado:"cancelada", nota:"Factura electrónica GP07444829. 60 unidades Bretaña 350ml (2 cajas). Pagada vía transferencia 27 may." },
  { proveedor:"Bavaria", factura:"BAV-KOPPS-19186", fecha:"2026-05-27", vence:"2026-05-27", valor:430143, detalle:true, estado:"cancelada", nota:"Remisión KOPPS Commercial F-AIO-00019186. 2 cajas Club Colombia + Corona + Stella + Coronita + sixpacks. Pagada vía transferencia 27 may." },
  { proveedor:"Casa Limpia", factura:"CASALIMPIA-PED1370", fecha:"2026-05-27", vence:"2026-05-27", valor:144000, detalle:true, estado:"cancelada", nota:"Pedido PED 1370. 4 papel higiénico Jumbo + Limpia Pisos + Desmanchador + domicilio $5.000. Pagada vía transferencia 27 may ($139.000 + $5.000)." },
  { proveedor:"Servicio Instalación (Nequi)", factura:"TVBASE-27may", fecha:"2026-05-27", vence:"2026-05-27", valor:200000, detalle:true, estado:"cancelada", nota:"Instalación base TV en barra - CAPEX renovación lounge. Pagada vía transferencia Nequi 3105280949 (comprobante G1BJ0JZWX8)." },
  { proveedor:"Cervezas y Cervezas Ltda", factura:"CYC-POE54773", fecha:"2026-06-17", vence:"2026-06-17", valor:490300, detalle:true, estado:"cancelada", nota:"Factura POE 54773. CONTADO - pagada efectivo (fuera de la caja del cuadre, no en gastos del 17). Reposición que entró al inventario el 17 jun: 2 Club Colombia 330x30 ($175.000), 1 Poker 330x30 ($66.800), 1 Águila Light 330x30 ($69.500), 1 Corona TW 24 ($89.800), 1 Stella Artois NRB3 24 ($89.200). Mapeo POS: Corona +24, Importada +24 (Stella), Nacional +120 (Club 60 + Poker 30 + Light 30)." },
  { proveedor:"GIR (Licores Junior)", factura:"PENDIENTE-31jul", fecha:"2026-07-31", vence:"2026-08-30", valor:919100, detalle:false, estado:"pendiente", nota:"🚩 COMPRA A CRÉDITO — FACTURA AÚN NO RECIBIDA (confirmado por Juanma). Reposición de cierre de mes que entró al inventario el 31-jul: Smirnoff +6, Ron Caldas botella +2 y media +2, Tequila botella +2, Amarillo BOT +2, Aguardiente Antioqueño botella +2, Buchanan's botella +1 y media +1, Old Parr botella +1 y media +1. VALOR ESTIMADO $919.100 a costo de CATÁLOGO, NO es cifra de factura: excluye 6 SMIRNOFF y 2 AMARILLO BOT porque esos SKUs no tienen precio de compra registrado. El valor real será MAYOR. Actualizar en cuanto llegue la factura." },
];

// ─── Gastos pagados por transferencia (no aparecen en cuadre del POS) ───
const PRELOADED_GASTOS_TRANSFERENCIA = [
  // SEMANA 1: Lun 30 mar — Dom 5 abr (Total: $624.000)
  { date: "2026-03-30", semana: 1, periodo: "Sem 1 (30 mar - 5 abr)", concepto: "Licor Milton", categoria: "Bebidas/Licor", valor: 0 },
  { date: "2026-03-30", semana: 1, periodo: "Sem 1 (30 mar - 5 abr)", concepto: "Limón", categoria: "Insumos coctelería", valor: 100000 },
  { date: "2026-03-30", semana: 1, periodo: "Sem 1 (30 mar - 5 abr)", concepto: "Claro internet", categoria: "Servicios", valor: 137000 },
  { date: "2026-03-30", semana: 1, periodo: "Sem 1 (30 mar - 5 abr)", concepto: "Base caja", categoria: "Operación tesorería", valor: 387000 },
  // SEMANA 2: Lun 6 abr — Dom 19 abr (Total: $270.000)
  { date: "2026-04-06", semana: 2, periodo: "Sem 2 (6 - 19 abr)", concepto: "Arreglo TV", categoria: "Mantenimiento", valor: 120000 },
  { date: "2026-04-06", semana: 2, periodo: "Sem 2 (6 - 19 abr)", concepto: "Arreglo sistema", categoria: "Mantenimiento", valor: 60000 },
  { date: "2026-04-06", semana: 2, periodo: "Sem 2 (6 - 19 abr)", concepto: "Nómina", categoria: "Nómina", valor: 90000 },
  // SEMANA 3: Lun 20 abr — Dom 26 abr (Total: $3.263.800)
  { date: "2026-04-20", semana: 3, periodo: "Sem 3 (20 - 26 abr)", concepto: "Base caja", categoria: "Operación tesorería", valor: 520000 },
  { date: "2026-04-20", semana: 3, periodo: "Sem 3 (20 - 26 abr)", concepto: "Nómina", categoria: "Nómina", valor: 659400 },
  { date: "2026-04-20", semana: 3, periodo: "Sem 3 (20 - 26 abr)", concepto: "Licores JR", categoria: "Bebidas/Licor", valor: 1729400 },
  { date: "2026-04-20", semana: 3, periodo: "Sem 3 (20 - 26 abr)", concepto: "Bavaria", categoria: "Bebidas/Licor", valor: 355000 },
  // SEMANA 4: Lun 27 abr — Dom 3 may
  { date: "2026-04-29", semana: 4, periodo: "Sem 4 (27 abr - 3 may)", concepto: "Nómina", categoria: "Nómina", valor: 155000 },
  { date: "2026-04-29", semana: 4, periodo: "Sem 4 (27 abr - 3 may)", concepto: "Postobón", categoria: "Bebidas/Licor", valor: 141500 },
  { date: "2026-04-29", semana: 4, periodo: "Sem 4 (27 abr - 3 may)", concepto: "Licores La Amistad", categoria: "Bebidas/Licor", valor: 1000700 },
  { date: "2026-04-30", semana: 4, periodo: "Sem 4 (27 abr - 3 may)", concepto: "Limón", categoria: "Insumos coctelería", valor: 110000 },
  // ─── MAYO 2026 ───
  { date: "2026-05-01", semana: 5, periodo: "Sem 1 may (27 abr - 3 may)", concepto: "Filin Trío (show 30 abr - 1 may)", categoria: "Eventos/Artistas", valor: 1400000 },
  { date: "2026-05-01", semana: 5, periodo: "Sem 1 may (27 abr - 3 may)", concepto: "Bavaria", categoria: "Bebidas/Licor", valor: 480400 },
  { date: "2026-05-02", semana: 5, periodo: "Sem 1 may (27 abr - 3 may)", concepto: "Licores Junior / La Amistad", categoria: "Bebidas/Licor", valor: 1364200 },
  // SEMANA 2 MAYO: Lun 4 may — Dom 10 may
  { date: "2026-05-07", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Vasos desechables Granizados (Caplas Todo Empaques)", categoria: "Insumos Granizados", valor: 97000 },
  { date: "2026-05-06", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Toppings Granizados", categoria: "Insumos Granizados", valor: 46000 },
  { date: "2026-05-07", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Líquido granizadora", categoria: "Insumos Granizados", valor: 254000 },
  { date: "2026-05-08", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Postobón", categoria: "Bebidas/Licor", valor: 198100 },
  { date: "2026-05-08", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Octavio Guaca", categoria: "Servicios/Otros", valor: 95000 },
  { date: "2026-05-08", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Licores Junior - Reintegro Tito", categoria: "Bebidas/Licor", valor: 412200 },
  { date: "2026-05-09", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Compra de Fruta", categoria: "Insumos coctelería", valor: 154300 },
  { date: "2026-05-09", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Duo Arcángel (show sábado 9 may)", categoria: "Eventos/Artistas", valor: 400000 },
  { date: "2026-05-09", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Licovacana del Pacífico - Reintegro Pipe", categoria: "Bebidas/Licor", valor: 272400 },
  { date: "2026-05-09", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Nómina Sábado 9 may", categoria: "Nómina", valor: 220000 },
  // Gastos adicionales semana 4-10 mayo (recibidos 12 mayo)
  { date: "2026-05-04", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Limón", categoria: "Insumos coctelería", valor: 110000 },
  { date: "2026-05-04", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Erika - Administración abril", categoria: "Servicios/Otros", valor: 450000 },
  { date: "2026-05-04", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Reinaldo - Insumos coctelería", categoria: "Insumos coctelería", valor: 387000 },
  { date: "2026-05-04", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Gustavo - Reembolso compras", categoria: "Bebidas/Licor", valor: 349000 },
  { date: "2026-05-08", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Casa Limpia (papel, ambient., pato)", categoria: "Servicios", valor: 145000 },
  { date: "2026-05-04", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Nómina Lunes 4 may", categoria: "Nómina", valor: 155000 },
  { date: "2026-05-05", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Nómina Martes 5 may", categoria: "Nómina", valor: 155000 },
  { date: "2026-05-06", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Nómina Miércoles 6 may", categoria: "Nómina", valor: 155000 },
  { date: "2026-05-07", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Nómina Jueves 7 may", categoria: "Nómina", valor: 155000 },
  { date: "2026-05-08", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Nómina Viernes 8 may", categoria: "Nómina", valor: 200000 },
  { date: "2026-05-10", semana: 6, periodo: "Sem 2 may (4 - 10 may)", concepto: "Nómina Domingo 10 may", categoria: "Nómina", valor: 155000 },
  // ─── Semana 3 may (11 - 17 may) ───
  { date: "2026-05-15", semana: 7, periodo: "Sem 3 may (11 - 17 may)", concepto: "Revisión Bomberos", categoria: "Servicios/Otros", valor: 289900 },
  { date: "2026-05-16", semana: 7, periodo: "Sem 3 may (11 - 17 may)", concepto: "Postobón", categoria: "Bebidas/Licor", valor: 60500 },
  { date: "2026-05-11", semana: 7, periodo: "Sem 3 may (11 - 17 may)", concepto: "Nómina Lunes 11 may", categoria: "Nómina", valor: 155000 },
  { date: "2026-05-14", semana: 7, periodo: "Sem 3 may (11 - 17 may)", concepto: "Nómina Jueves 14 may", categoria: "Nómina", valor: 155000 },
  { date: "2026-05-14", semana: 7, periodo: "Sem 3 may (11 - 17 may)", concepto: "2 Bases para mesas (Nequí)", categoria: "Activo fijo", valor: 390000 },
  { date: "2026-05-15", semana: 7, periodo: "Sem 3 may (11 - 17 may)", concepto: "Nómina Viernes 15 may", categoria: "Nómina", valor: 200000 },
  { date: "2026-05-16", semana: 7, periodo: "Sem 3 may (11 - 17 may)", concepto: "Nómina Sábado 16 may", categoria: "Nómina", valor: 220000 },
  { date: "2026-05-17", semana: 7, periodo: "Sem 3 may (11 - 17 may)", concepto: "Nómina Domingo 17 may", categoria: "Nómina", valor: 170000 },
  { date: "2026-05-15", semana: 7, periodo: "Sem 3 may (11 - 17 may)", concepto: "Compra de Fruta", categoria: "Insumos coctelería", valor: 208000 },
  // ─── Semana 4 may (18 - 24 may) ───
  { date: "2026-05-19", semana: 8, periodo: "Sem 4 may (18 - 24 may)", concepto: "Sombrillas zona exterior (Bre-B Variedad del Mueble)", categoria: "Activo fijo", valor: 325000 },
  { date: "2026-05-21", semana: 8, periodo: "Sem 4 may (18 - 24 may)", concepto: "Pago Fruta", categoria: "Insumos coctelería", valor: 153000 },
  { date: "2026-05-21", semana: 8, periodo: "Sem 4 may (18 - 24 may)", concepto: "Insumos y licor (D1)", categoria: "Insumos varios", valor: 58350 },
  { date: "2026-05-21", semana: 8, periodo: "Sem 4 may (18 - 24 may)", concepto: "Coca-Cola", categoria: "Bebidas/Licor", valor: 153800 },
  { date: "2026-05-21", semana: 8, periodo: "Sem 4 may (18 - 24 may)", concepto: "Coca-Cola (envases)", categoria: "Bebidas/Licor", valor: 4500 },
  { date: "2026-05-21", semana: 8, periodo: "Sem 4 may (18 - 24 may)", concepto: "Postobón", categoria: "Bebidas/Licor", valor: 89500 },
  { date: "2026-05-22", semana: 8, periodo: "Sem 4 may (18 - 24 may)", concepto: "Marketing Digital Redes (Nequí)", categoria: "Servicios", valor: 300000 },
  { date: "2026-05-22", semana: 8, periodo: "Sem 4 may (18 - 24 may)", concepto: "Show Mariachi Monterrey", categoria: "Eventos/Artistas", valor: 600000 },
  { date: "2026-05-22", semana: 8, periodo: "Sem 4 may (18 - 24 may)", concepto: "Sillas Rimax (Bre-B MKT06)", categoria: "Activo fijo", valor: 440300 },
  { date: "2026-05-22", semana: 8, periodo: "Sem 4 may (18 - 24 may)", concepto: "Limones (Nequí Renson Erazo)", categoria: "Insumos coctelería", valor: 110000 },
  { date: "2026-05-22", semana: 8, periodo: "Sem 4 may (18 - 24 may)", concepto: "Seguridad Centinela", categoria: "Servicios", valor: 125000 },
  { date: "2026-05-22", semana: 8, periodo: "Sem 4 may (18 - 24 may)", concepto: "Compra contado Licores Junior", categoria: "Bebidas/Licor", valor: 663000 },
  { date: "2026-05-23", semana: 8, periodo: "Sem 4 may (18 - 24 may)", concepto: "2 Bases para sonido exterior (Nequí Kevin Sebastián Medina)", categoria: "Activo fijo", valor: 110000 },
  // ─── Semana 5 may (25 - 31 may) ───
  { date: "2026-05-26", semana: 9, periodo: "Sem 5 may (25 - 31 may)", concepto: "Pago a cuenta Licores Junior (sin asignar facturas)", categoria: "Pago proveedor (no operativo)", valor: 992000 },
  { date: "2026-05-26", semana: 9, periodo: "Sem 5 may (25 - 31 may)", concepto: "Instalación bases parlantes exterior (Nequí José Gómez)", categoria: "Activo fijo", valor: 46000 },
  { date: "2026-05-26", semana: 9, periodo: "Sem 5 may (25 - 31 may)", concepto: "Insumos baños (Bre-B Pro Cleaner)", categoria: "Insumos varios", valor: 90000 },
  { date: "2026-05-27", semana: 9, periodo: "Sem 5 may (25 - 31 may)", concepto: "Postobón (Bretaña 60und, factura GP07444829)", categoria: "Bebidas/Licor", valor: 115000 },
  { date: "2026-05-27", semana: 9, periodo: "Sem 5 may (25 - 31 may)", concepto: "Bavaria (KOPPS remisión F-AIO-00019186)", categoria: "Bebidas/Licor", valor: 430143 },
  { date: "2026-05-27", semana: 9, periodo: "Sem 5 may (25 - 31 may)", concepto: "Casa Limpia (aseo + domicilio, PED 1370)", categoria: "Insumos varios", valor: 144000 },
  { date: "2026-05-27", semana: 9, periodo: "Sem 5 may (25 - 31 may)", concepto: "Instalación base TV barra (Nequí 3105280949)", categoria: "Activo fijo", valor: 200000 },
  { date: "2026-05-29", semana: 9, periodo: "Sem 5 may (25 - 31 may)", concepto: "Show cantante Carlos Valencia (Nequí)", categoria: "Entretenimiento/Eventos", valor: 400000 },
  { date: "2026-05-29", semana: 9, periodo: "Sem 5 may (25 - 31 may)", concepto: "Lava platos 1.20m cubierta poceta (IMVEL FVE6190)", categoria: "Activo fijo", valor: 315000 },
  { date: "2026-05-29", semana: 9, periodo: "Sem 5 may (25 - 31 may)", concepto: "Estructura lava platos (Bre-B James Olivier Medina, comprobante TRwdUF1NmoEC)", categoria: "Activo fijo", valor: 380000 },
  { date: "2026-05-29", semana: 9, periodo: "Sem 5 may (25 - 31 may)", concepto: "Líquido máquina granizadora (transf. Rodolfo Muñoz Zapata, comprobante 0000025000)", categoria: "Insumos granizados", valor: 176000 },
  { date: "2026-05-30", semana: 9, periodo: "Sem 5 may (25 - 31 may)", concepto: "Internet Claro mes mayo (Bancolombia, comprobante TR260530223432BFyElK, ref 78767924)", categoria: "Servicios", valor: 167007 },
  { date: "2026-05-30", semana: 9, periodo: "Sem 5 may (25 - 31 may)", concepto: "Lava traperos (Ferretería La Reina, Redeban débito)", categoria: "Activo fijo", valor: 161990 },
  { date: "2026-05-25", semana: 9, periodo: "Sem 5 may (25 - 31 may)", concepto: "Nómina domingo 24 + lunes 25 may", categoria: "Nómina", valor: 370000 },
  { date: "2026-05-30", semana: 9, periodo: "Sem 5 may (25 - 31 may)", concepto: "Compra Ron y Vodka Don Luis (DL) - reposición (explica RON DL +5 inv 30 may)", categoria: "Compra Licores", valor: 140000 },
  { date: "2026-06-01", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Andrés Chávez - cableado audio y video El Búnker (CAPEX preparación apertura)", categoria: "Capex El Búnker", valor: 227000 },
  { date: "2026-06-01", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Visita Bomberos La Sala (trámite/permiso)", categoria: "Trámites", valor: 350000 },
  { date: "2026-06-02", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Portavasos y copas La Sala/El Búnker (transf. a Jaime de Jesús Castaño, comprobante 0000074300, pagada 3 jun)", categoria: "Menaje bar", valor: 680000 },
  { date: "2026-06-02", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Anticipo 60% Alarma Centinela EL BÚNKER (Davivienda comprobante 110657, pagada 3 jun; saldo 40% pendiente)", categoria: "Capex El Búnker", valor: 1358000 },
  { date: "2026-06-05", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Licovacana Promo Antioqueño (La Sala) [fecha origen 5/06; se asume 2026]", categoria: "Promoción", valor: 283504 },
  { date: "2026-06-05", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Licovacana Promo Antioqueño (La Sala) [fecha origen 5/06; se asume 2026]", categoria: "Promoción", valor: 283504 },
  { date: "2026-06-06", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Hielo La Sala", categoria: "Insumos coctelería", valor: 32500 },
  { date: "2026-06-06", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Sal, tahín, platos La Sala", categoria: "Insumos cocina", valor: 61900 },
  { date: "2026-06-07", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Paca Corona El Búnker (mercancía)", categoria: "Capex El Búnker", valor: 86400 },
  { date: "2026-06-07", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Llave/lava traperos El Búnker", categoria: "Capex El Búnker", valor: 27700 },
  { date: "2026-06-07", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Papelería La Sala (comandas, cauchos, lapiceros, calculadora, tijeras, cuaderno)", categoria: "Papelería", valor: 78500 },
  { date: "2026-06-07", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Chapa baño El Búnker", categoria: "Capex El Búnker", valor: 24500 },
  { date: "2026-06-07", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Candado El Búnker", categoria: "Capex El Búnker", valor: 30000 },
  { date: "2026-06-06", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Bavaria La Sala (compra cerveza)", categoria: "Compra Cerveza", valor: 625244 },
  { date: "2026-06-06", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Mecato El Búnker (mercancía)", categoria: "Capex El Búnker", valor: 170000 },
  { date: "2026-06-06", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Nómina y base La Sala", categoria: "Nómina", valor: 440000 },
  { date: "2026-06-05", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Pago show cantantes (chicas) La Sala", categoria: "Show/Eventos", valor: 400000 },
  { date: "2026-06-05", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Pago datáfono y QR Bold La Sala", categoria: "Servicios financieros", valor: 378000 },
  { date: "2026-06-05", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Cervezas y Cervezas - La Sala (reposición cerveza)", categoria: "Pago proveedor (no operativo)", valor: 313600 },
  { date: "2026-06-05", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Candado El Búnker", categoria: "Capex El Búnker", valor: 381965 },
  { date: "2026-06-05", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Señales Bomberos La Sala", categoria: "Seguridad", valor: 18000 },
  { date: "2026-06-05", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Derechos de autor El Búnker (Sayco/Acinpro)", categoria: "Capex El Búnker", valor: 358000 },
  { date: "2026-06-05", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Señales de seguridad industrial El Búnker", categoria: "Capex El Búnker", valor: 287500 },
  { date: "2026-06-04", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Materiales Andrés Chávez audio y video El Búnker (3)", categoria: "Capex El Búnker", valor: 246000 },
  { date: "2026-06-04", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Pedido Postobón La Sala", categoria: "Bebidas no alcohólicas", valor: 89500 },
  { date: "2026-06-04", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Instalación bases TV El Búnker", categoria: "Capex El Búnker", valor: 710000 },
  { date: "2026-06-04", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Programa James Vidal El Búnker", categoria: "Capex El Búnker", valor: 1000000 },
  { date: "2026-06-04", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Pago Guía Rinos publicidad La Sala", categoria: "Publicidad", valor: 40430 },
  { date: "2026-06-04", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Banderas Mundial La Sala (decoración)", categoria: "Publicidad", valor: 104000 },
  { date: "2026-06-03", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Materiales Andrés Chávez audio y video El Búnker (2)", categoria: "Capex El Búnker", valor: 222000 },
  { date: "2026-06-01", semana: 10, periodo: "Sem 1 jun (1 - 7 jun)", concepto: "Anticipo banderas La Sala (decoración)", categoria: "Publicidad", valor: 104000 },
  { date: "2026-06-09", semana: 11, periodo: "Sem 2 jun (8 - 14 jun)", concepto: "Saldo letrero El Búnker", categoria: "Capex El Búnker", valor: 2200000 },
  { date: "2026-06-09", semana: 11, periodo: "Sem 2 jun (8 - 14 jun)", concepto: "Cinta seguridad industrial piso (El Búnker y La Sala, compartido)", categoria: "Seguridad", valor: 54900 },
  { date: "2026-06-09", semana: 11, periodo: "Sem 2 jun (8 - 14 jun)", concepto: "Polisombra El Búnker", categoria: "Capex El Búnker", valor: 92000 },
  { date: "2026-06-09", semana: 11, periodo: "Sem 2 jun (8 - 14 jun)", concepto: "Recipientes plásticos, porta escobas, herramientas El Búnker", categoria: "Capex El Búnker", valor: 165000 },
  { date: "2026-06-09", semana: 11, periodo: "Sem 2 jun (8 - 14 jun)", concepto: "Pago limones La Sala (2 facturas)", categoria: "Insumos coctelería", valor: 210000 },
  { date: "2026-06-09", semana: 11, periodo: "Sem 2 jun (8 - 14 jun)", concepto: "Pago/devolución botella de vino - Gustavo (barman) La Sala (transf. Bold 10 jun HV5WNUJ4PY)", categoria: "Insumos bar", valor: 25000 },
  { date: "2026-06-09", semana: 11, periodo: "Sem 2 jun (8 - 14 jun)", concepto: "Banderas ambientación Mundial La Sala (parte de pago compartido $120k)", categoria: "Publicidad", valor: 30000 },
  { date: "2026-06-09", semana: 11, periodo: "Sem 2 jun (8 - 14 jun)", concepto: "Banderas ambientación Mundial El Búnker (parte de pago compartido $120k)", categoria: "Capex El Búnker", valor: 90000 },
  { date: "2026-06-09", semana: 11, periodo: "Sem 2 jun (8 - 14 jun)", concepto: "Tela cortina El Búnker", categoria: "Capex El Búnker", valor: 75000 },
  { date: "2026-06-10", semana: 11, periodo: "Sem 2 jun (8 - 14 jun)", concepto: "Pago cartera Licores Junior (GIR) - 9 facturas + abono FDJC10560 (Recibo RC095550)", categoria: "Pago proveedor (no operativo)", valor: 2593000 },
  { date: "2026-06-10", semana: 11, periodo: "Sem 2 jun (8 - 14 jun)", concepto: "Pago proveedor Distribuidora El Rey / Reinaldo (transf. Bold 10 jun)", categoria: "Pago proveedor (no operativo)", valor: 647000 },
  { date: "2026-06-09", semana: 11, periodo: "Sem 2 jun (8 - 14 jun)", concepto: "Pago cartera Licores Junior (GIR) - facturas FDJC9405 + FDJC9420 (transferencia 9 jun)", categoria: "Pago proveedor (no operativo)", valor: 451200 },
  { date: "2026-06-13", semana: 11, periodo: "Sem 2 jun (8 - 14 jun)", concepto: "Pago show cantante (viernes 12 jun) La Sala", categoria: "Show/Eventos", valor: 400000 },
  { date: "2026-06-13", semana: 11, periodo: "Sem 2 jun (8 - 14 jun)", concepto: "Pago Licores Junior (GEG) factura FDJC11222 La Sala - reposición 13 jun (transf. Bold $369.700)", categoria: "Pago proveedor (no operativo)", valor: 369700 },
  { date: "2026-06-13", semana: 11, periodo: "Sem 2 jun (8 - 14 jun)", concepto: "Compra limón/cítricos (Cítricos Narváez fact. 11543) La Sala - vía Nequi", categoria: "Insumos coctelería", valor: 100000 },
  { date: "2026-06-14", semana: 11, periodo: "Sem 2 jun (8 - 14 jun)", concepto: "Compra Licores Junior (GEG pedido PV2000160) El Búnker - cerveza águila/club + aguardiente amarillo", categoria: "El Búnker (no operativo)", valor: 336800 },
  { date: "2026-06-15", semana: 12, periodo: "Sem 3 jun (15 - 21 jun)", concepto: "Transferencia Andrés Chávez - Instalación audio y video El Búnker", categoria: "Capex El Búnker", valor: 1000000 },
  { date: "2026-06-19", semana: 12, periodo: "Sem 3 jun (15 - 21 jun)", concepto: "Saldo letrero El Búnker - vinilos nevera", categoria: "Capex El Búnker", valor: 150000 },
  { date: "2026-06-19", semana: 12, periodo: "Sem 3 jun (15 - 21 jun)", concepto: "Pedido Coca-Cola para El Búnker", categoria: "El Búnker (no operativo)", valor: 349800 },
  { date: "2026-06-17", semana: 12, periodo: "Sem 3 jun (15 - 21 jun)", concepto: "Butacos plásticos (para La Sala y El Búnker - compartido)", categoria: "Capex compartido La Sala/Búnker", valor: 672000 },
  { date: "2026-06-17", semana: 12, periodo: "Sem 3 jun (15 - 21 jun)", concepto: "Cervezas 4 canastas (Cervezas y Cervezas) para El Búnker", categoria: "El Búnker (no operativo)", valor: 314000 },
  { date: "2026-06-16", semana: 12, periodo: "Sem 3 jun (15 - 21 jun)", concepto: "Pago Ron DL coctelería La Sala (reposición 16 jun)", categoria: "Pago proveedor (no operativo)", valor: 100000 },
  { date: "2026-06-16", semana: 12, periodo: "Sem 3 jun (15 - 21 jun)", concepto: "Pago nómina La Sala (15 y 16 jun)", categoria: "Nómina", valor: 385000 },
  { date: "2026-06-16", semana: 12, periodo: "Sem 3 jun (15 - 21 jun)", concepto: "Renson Rene Erazo - limón La Sala (16 jun)", categoria: "Insumos coctelería", valor: 100000 },
  { date: "2026-06-18", semana: 12, periodo: "Sem 3 jun (15 - 21 jun)", concepto: "Jose Campo - centinela/vigilancia", categoria: "Seguridad/Vigilancia", valor: 125000 },
  { date: "2026-06-17", semana: 12, periodo: "Sem 3 jun (15 - 21 jun)", concepto: "Licores Junior - compra El Búnker (Partido Colombia)", categoria: "El Búnker (no operativo)", valor: 487600 },
  { date: "2026-06-17", semana: 12, periodo: "Sem 3 jun (15 - 21 jun)", concepto: "Licores Junior - compra El Búnker (Partido Colombia, Whisky Jack Daniels)", categoria: "El Búnker (no operativo)", valor: 223000 },
  { date: "2026-06-20", semana: 12, periodo: "Sem 3 jun (15 - 21 jun)", concepto: "Renson Rene Erazo - limón La Sala (20 jun)", categoria: "Insumos coctelería", valor: 90000 },
  { date: "2026-06-19", semana: 12, periodo: "Sem 3 jun (15 - 21 jun)", concepto: "Directiv GO - El Búnker y La Sala (servicio compartido)", categoria: "Servicios (compartido)", valor: 64000 },
  { date: "2026-06-19", semana: 12, periodo: "Sem 3 jun (15 - 21 jun)", concepto: "Fruta La Sala", categoria: "Insumos cocina", valor: 126000 },
  { date: "2026-06-17", semana: 12, periodo: "Sem 3 jun (15 - 21 jun)", concepto: "Pedido Bavaria - La Sala (cerveza)", categoria: "Pago proveedor (no operativo)", valor: 450000 },
  { date: "2026-06-17", semana: 12, periodo: "Sem 3 jun (15 - 21 jun)", concepto: "Refuerzo base pared TV La Sala", categoria: "Capex La Sala", valor: 60000 },
  { date: "2026-06-22", semana: 13, periodo: "Sem 4 jun (22 - 28 jun)", concepto: "Compra de contado Licores Junior F1JC70279 - LA SALA (valor total). Contenido La Sala + cantidades cedidas a El Búnker SOLO en producto (18 Smirnoff Ice + 42 Smirnoff Green Apple); el dinero lo asume La Sala completo. La Sala se queda: Coca-Cola 36, Agua 24, Postobón soda 48, Club lata 24, Corona 48, Stella 24, Ron Caldas bot/can 2/2, Caucano 5, Amarillo bot/can 3/3, Tequila J.Cuervo 2, Martini Dry 1, Smirnoff Ice 6, Smirnoff Green Apple 6, Jugo Hit mango/lulo 12/12", categoria: "Pago proveedor (no operativo)", valor: 1890500 },
  { date: "2026-06-23", semana: 13, periodo: "Sem 4 jun (22 - 28 jun)", concepto: "Compra de contado Cervezas y Cervezas POE 55231 - La Sala (NIT 76328754-0): Club 30, Águila Light 24, Club Trigo 30, Poker 24, Aguardiente Azul Litro 3, Aguardiente Verde Media 3, envases 5", categoria: "Pago proveedor (no operativo)", valor: 512800 },
  { date: "2026-06-23", semana: 13, periodo: "Sem 4 jun (22 - 28 jun)", concepto: "Compra limón La Sala (insumo coctelería)", categoria: "Insumos coctelería", valor: 100000 },
  { date: "2026-06-23", semana: 13, periodo: "Sem 4 jun (22 - 28 jun)", concepto: "Compra Licovanaca del Pacífico - 6 botellas Aguardiente Antioqueño + 2 medias Antioqueño promoción (entró a inventario La Sala)", categoria: "Pago proveedor (no operativo)", valor: 272405 },
  { date: "2026-06-27", semana: 13, periodo: "Sem 4 jun (22 - 28 jun)", concepto: "Cervezas y Cervezas - La Sala (reposición cerveza del 27: Corona +48, Nacional +60)", categoria: "Pago proveedor (no operativo)", valor: 334000 },
  { date: "2026-06-27", semana: 13, periodo: "Sem 4 jun (22 - 28 jun)", concepto: "Fruta - La Sala (insumo coctelería/cocina)", categoria: "Insumos coctelería", valor: 76000 },
  { date: "2026-06-27", semana: 13, periodo: "Sem 4 jun (22 - 28 jun)", concepto: "Insumos coctelería - La Sala", categoria: "Insumos coctelería", valor: 117000 },
  { date: "2026-06-25", semana: 13, periodo: "Sem 4 jun (22 - 28 jun)", concepto: "Compra Coca-Cola (reposición gaseosa La Sala)", categoria: "Pago proveedor (no operativo)", valor: 62500 },
  { date: "2026-06-30", semana: 14, periodo: "Sem 5 jun (29 jun - 5 jul)", concepto: "Pago proveedor Distribuidora El Rey / Reinaldo", categoria: "Pago proveedor (no operativo)", valor: 684000 },
  { date: "2026-06-30", semana: 14, periodo: "Sem 5 jun (29 jun - 5 jul)", concepto: "Administración Erika - mes de mayo 2026 (pagado 30 jun)", categoria: "Administración", valor: 450000 },
  { date: "2026-06-30", semana: 14, periodo: "Sem 5 jun (29 jun - 5 jul)", concepto: "Fruta - La Sala (insumo coctelería/cocina). FLAG: monto alto ($372.550) vs típico ~$76k — confirmar si es solo La Sala o compartido con El Búnker", categoria: "Insumos coctelería", valor: 372550 },
  { date: "2026-06-30", semana: 14, periodo: "Sem 5 jun (29 jun - 5 jul)", concepto: "Pago Bavaria - La Sala (proveedor cerveza)", categoria: "Pago proveedor (no operativo)", valor: 455000 },
  { date: "2026-07-02", semana: 14, periodo: "Sem 5 jun (29 jun - 5 jul)", concepto: "Transferencia Coca-Cola La Sala (proveedor gaseosa)", categoria: "Pago proveedor (no operativo)", valor: 83000 },
  { date: "2026-07-07", semana: 15, periodo: "Sem 1 jul (6 - 12 jul)", concepto: "Limón - La Sala (insumo coctelería). FLAG: monto alto ($170.000) vs típico ~$100k — confirmar si es solo La Sala o compartido con El Búnker", categoria: "Insumos coctelería", valor: 170000 },
  { date: "2026-07-08", semana: 15, periodo: "Sem 1 jul (6 - 12 jul)", concepto: "Licores Milton (MIL) - abono cartera ABRIL 2026", categoria: "Pago proveedor (no operativo)", valor: 1261000 },
  { date: "2026-07-08", semana: 15, periodo: "Sem 1 jul (6 - 12 jul)", concepto: "Licores Milton (MIL) - abono cartera MAYO 2026", categoria: "Pago proveedor (no operativo)", valor: 3535000 },
  { date: "2026-07-08", semana: 15, periodo: "Sem 1 jul (6 - 12 jul)", concepto: "Licores Milton (MIL) - abono cartera JUNIO 2026", categoria: "Pago proveedor (no operativo)", valor: 3368000 },
  { date: "2026-07-03", semana: 14, periodo: "Sem 5 jun (29 jun - 5 jul)", concepto: "El Búnker - insumos de aseo", categoria: "Servicios/Otros", valor: 69000 },
  { date: "2026-07-03", semana: 14, periodo: "Sem 5 jun (29 jun - 5 jul)", concepto: "Compra en efectivo - insumos varios (sal, afilador, papel higiénico, destapadores)", categoria: "Servicios/Otros", valor: 40000 },
  { date: "2026-07-07", semana: 15, periodo: "Sem 1 jul (6 - 12 jul)", concepto: "El Búnker - yute y amarras (decoración/insumos)", categoria: "Servicios/Otros", valor: 38000 },
  { date: "2026-07-07", semana: 15, periodo: "Sem 1 jul (6 - 12 jul)", concepto: "Máquina para abrir ojales (probable El Búnker, va con yute/amarras)", categoria: "Servicios/Otros", valor: 48000 },
  { date: "2026-07-11", semana: 15, periodo: "Sem 1 jul (6 - 12 jul)", concepto: "Limón - La Sala (2 facturas)", categoria: "Insumos coctelería", valor: 160000 },
  { date: "2026-07-11", semana: 15, periodo: "Sem 1 jul (6 - 12 jul)", concepto: "Facturas varias La Sala. FLAG: sin desglose — pedir detalle de qué cubre", categoria: "Por itemizar", valor: 442000 },
  { date: "2026-07-12", semana: 15, periodo: "Sem 1 jul (6 - 12 jul)", concepto: "Internet Claro La Sala - 2 meses", categoria: "Servicios/Otros", valor: 247215 },
  { date: "2026-07-15", semana: 16, periodo: "Sem 2 jul (13 - 19 jul)", concepto: "Pago Luis Carlos Velasco", categoria: "Servicios/Otros", valor: 100000 },
  { date: "2026-07-16", semana: 16, periodo: "Sem 2 jul (13 - 19 jul)", concepto: "Pulpa de fruta - insumo coctelería", categoria: "Insumos coctelería", valor: 68000 },
  { date: "2026-07-16", semana: 16, periodo: "Sem 2 jul (13 - 19 jul)", concepto: "Licores Junior (GIR) - abono cartera", categoria: "Pago proveedor (no operativo)", valor: 1177575 },
  { date: "2026-07-16", semana: 16, periodo: "Sem 2 jul (13 - 19 jul)", concepto: "Compra caja x24 Cerveza Corona (reposición inventario)", categoria: "Reposición inventario", valor: 86900 },
  { date: "2026-07-18", semana: 16, periodo: "Sem 2 jul (13 - 19 jul)", concepto: "Compra Bavaria La Sala (reposición cerveza)", categoria: "Reposición inventario", valor: 693300 },
  { date: "2026-07-19", semana: 16, periodo: "Sem 2 jul (13 - 19 jul)", concepto: "Pago combinado: nómina 19-jul $197.500 + pulpa de fruta $61.750 + Cervezas y Cervezas $154.300 + Coca-Cola $40.000. ⚠️ FLAG: los componentes suman $453.550 pero el total transferido es $735.915 — faltan $282.365 por identificar", categoria: "Por itemizar", valor: 735915 },
  { date: "2026-07-20", semana: 17, periodo: "Sem 3 jul (20 - 26 jul)", concepto: "Distribuidora El Rey / Reinaldo - pago facturas", categoria: "Pago proveedor (no operativo)", valor: 615500 },
  { date: "2026-07-20", semana: 17, periodo: "Sem 3 jul (20 - 26 jul)", concepto: "Limón (facturas 11, 17 y 19 de julio)", categoria: "Insumos coctelería", valor: 240000 },
  { date: "2026-07-21", semana: 17, periodo: "Sem 3 jul (20 - 26 jul)", concepto: "Luis Carlos Velasco - 10 litros de ginebra (reposición inventario)", categoria: "Reposición inventario", valor: 200000 },
  { date: "2026-07-21", semana: 17, periodo: "Sem 3 jul (20 - 26 jul)", concepto: "Compra Buchanan's 18 años - La Sala", categoria: "Reposición inventario", valor: 411000, nota: "CONFIRMADO (Juanma): la botella trasladada a El Búnker el 26-jul NO es esta — fue la de 12 años ($156.800). Entonces esta de 18 años es la que se compró y vendió el mismo día 21-jul (Ent 1 / Sal 1). ⚠️ En el bar del 21-jul quedó valorizada a un PVP ESTIMADO de $250.000, que está POR DEBAJO de su costo de $411.000. Ese día el estanco POS quedó $144.000 por encima de la reconstrucción; si esos $144.000 son de esta botella, el PVP real sería ~$394.000 — todavía por debajo del costo. Confirmar el PVP de carta del Buchanan's 18 años." },
  { date: "2026-07-22", semana: 17, periodo: "Sem 3 jul (20 - 26 jul)", concepto: "Pago administración La Sala mes de junio - Julián Pistala", categoria: "Administración", valor: 450000 },
  { date: "2026-07-24", semana: 17, periodo: "Sem 3 jul (20 - 26 jul)", concepto: "Nóminas La Sala - martes 21, miércoles 22 y jueves 23 de julio", categoria: "Nómina", valor: 570000, nota: "🚩 Estos tres días registran NÓMINA $0 en el cuadre POS porque se pagó por transferencia. El neto contable de 21, 22 y 23-jul está sobrestimado en ~$190.000/día." },
  { date: "2026-07-24", semana: 17, periodo: "Sem 3 jul (20 - 26 jul)", concepto: "Show cantante Jorge Medina - La Sala viernes 24 de julio", categoria: "Show/Eventos", valor: 600000, nota: "El viernes 24 fue el mejor día del mes ($1.463.400). Con el show a $600.000 el margen real del día cae de $725.620 a ~$125.620." },
  { date: "2026-07-24", semana: 17, periodo: "Sem 3 jul (20 - 26 jul)", concepto: "Reparación parlante La Sala - TV Centro", categoria: "Mantenimiento", valor: 160000 },
  { date: "2026-07-24", semana: 17, periodo: "Sem 3 jul (20 - 26 jul)", concepto: "Centinela La Sala - julio", categoria: "Seguridad/Vigilancia", valor: 125000 },
  { date: "2026-07-24", semana: 17, periodo: "Sem 3 jul (20 - 26 jul)", concepto: "Pedido de aseo - proveedor Casa Limpia (La Sala)", categoria: "Insumos varios", valor: 110000 },
  { date: "2026-07-24", semana: 17, periodo: "Sem 3 jul (20 - 26 jul)", concepto: "Compra limón La Sala", categoria: "Insumos coctelería", valor: 80000 },
  { date: "2026-07-25", semana: 17, periodo: "Sem 3 jul (20 - 26 jul)", concepto: "Nómina El Búnker viernes 24 de julio", categoria: "El Búnker (no operativo)", valor: 290000, nota: "Gasto de El Búnker registrado en el ledger de La Sala por pedido de Juanma. NO es costo operativo de La Sala." },
  { date: "2026-07-27", semana: 18, periodo: "Sem 4 jul (27 jul - 2 ago)", concepto: "Facturas varias La Sala (insumos aseo 62.910 + vinos 118.500 + fruta 39.140 + nómina 26 jul 185.000 + fresas 64.000 + Postobón 109.300)", categoria: "Por itemizar", valor: 612500, nota: "🚩 Los componentes suman $578.850; faltan $33.650 por identificar. Incluye la nómina del 26-jul ($185.000), día que el cuadre POS registra con nómina $0 — con ese costo el 26-jul cierra en PÉRDIDA de ~$27.610." },
  { date: "2026-07-29", semana: 18, periodo: "Sem 4 jul (27 jul - 2 ago)", concepto: "Video Camila - promoción redes sociales La Sala", categoria: "Publicidad", valor: 100000 },
  { date: "2026-07-29", semana: 18, periodo: "Sem 4 jul (27 jul - 2 ago)", concepto: "Cadena para pipa de gas y pedestal para extintor de 10 libras - La Sala", categoria: "Mantenimiento", valor: 62000 },
  { date: "2026-07-30", semana: 18, periodo: "Sem 4 jul (27 jul - 2 ago)", concepto: "Insumos coctelería La Sala", categoria: "Insumos coctelería", valor: 108000 },
  { date: "2026-07-29", semana: 18, periodo: "Sem 4 jul (27 jul - 2 ago)", concepto: "Compra limón La Sala (rotulada 01-08-2026)", categoria: "Insumos coctelería", valor: 160000, nota: "⚠️ FECHA CRUZADA: el concepto la rotula como 01-08-2026 pero el pago salió el 29-07. Registrada en la fecha del pago. Si el limón se consumió en agosto, es un costo de AGOSTO pagado en julio — definir criterio (caja vs devengo) antes del cierre. Es la 2da compra de limón del mes ($80.000 el 24-jul)." },
  { date: "2026-07-30", semana: 18, periodo: "Sem 4 jul (27 jul - 2 ago)", concepto: "Entrega efectivo para base de caja - El Búnker", categoria: "El Búnker (no operativo)", valor: 200000, nota: "NO ES GASTO: es un traslado de efectivo entre locales para la base de caja de El Búnker. No se consume, no toca el P&G de La Sala. Debe aparecer como ENTRADA de efectivo en El Búnker; si allá se registró como ingreso o como gasto, corregir. Cuenta por cobrar a El Búnker mientras no se devuelva." },
  { date: "2026-08-04", semana: 19, periodo: "Sem 1 ago (3 - 9 ago)", concepto: "Efectivo para pago de facturas (fruta 101.000 + coco 74.000 + fruta 2 115.500 + nómina 2, 3 y 4 de agosto 550.000)", categoria: "Por itemizar", valor: 874500, nota: "🚩 DOS TEMAS. (1) Los componentes suman $840.500; faltan $34.000 por identificar. (2) Incluye $550.000 de NÓMINA de los días 2, 3 y 4 de agosto, que en el POS registran nómina $0, $0 y $15.000 respectivamente — el neto de esos tres días está sobrestimado en ~$183.000/día. Con ese costo, el domingo 2 baja de $211.020 a ~$28.000 y el lunes 3 profundiza su pérdida de −$108.280 a ~−$291.000. Fruta y coco ($290.500) son insumos de coctelería." },
  { date: "2026-08-05", semana: 19, periodo: "Sem 1 ago (3 - 9 ago)", concepto: "Abono proveedor Licorería Milton (MIL) - licores e insumos de coctelería", categoria: "Pago proveedor (no operativo)", valor: 1000000, nota: "Abono a cartera de proveedor = NO OPERATIVO, no reduce el resultado del mes. Es el abono individual más grande registrado a Milton. Verificar contra el saldo de cartera con MIL y si corresponde a facturas ya cargadas en PRELOADED_CARTERA." },
];

// ─── Storage ───
const SK = { c:"sala5c", i:"sala5i", k:"sala5k", g:"sala5g", gt:"sala5gt" };

// ─── Helpers ───
const fmt=n=>{if(!n&&n!==0)return"$0";const a=Math.abs(n);if(a>=1e6)return`$${(n/1e6).toFixed(1)}M`;if(a>=1e3)return`$${(n/1e3).toFixed(0)}K`;return`$${n}`;};
const fmtF=n=>"$"+Math.round(n||0).toLocaleString("es-CO");
const pct=(a,b)=>b?`${((a/b)*100).toFixed(1)}%`:"—";
const DAYS=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MO=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const fmtD=d=>{const t=new Date(d+"T12:00:00");return`${DAYS[t.getDay()]} ${t.getDate()} ${MO[t.getMonth()]} ${t.getFullYear()}`;};

const C={bg:"#0c0b09",card:"#161412",bdr:"#2a2520",
  gold:"#c9943e",goldDim:"#7a5d28",
  green:"#34d399",greenDim:"#064e3b",red:"#f87171",redDim:"#7f1d1d",
  blue:"#60a5fa",purple:"#a78bfa",orange:"#fb923c",pink:"#f472b6",cyan:"#22d3ee",
  text:"#e8e0d4",dim:"#8a7e70",muted:"#5c554a"};
const PIE=[C.gold,C.cyan,C.orange,C.purple,C.pink,C.blue,C.green];

// ─── Clasificación de gastos: activo recuperable vs consumido vs no operativo ───
// (a) REPOSICIÓN INVENTARIO = stock embotellado que sigue en bodega (activo recuperable)
// (b) CONSUMIDO = dinero que sale y no vuelve (nómina, eventos, servicios, perecederos)
// (c) NO OPERATIVO = préstamos, activos fijos/CAPEX y movimientos que no son gasto operativo
const CAT_REPOSICION=new Set(["Bebidas/Licor","Bebidas","Compra Licores","Insumos bar","Bebidas no alcohólicas"]);
const clasificaGasto=(categoria)=>{
  const cat=(categoria||"").trim();
  if(/pr[eé]stamo|no operativo|activo fijo|capex|mobiliario|inversi[oó]n/i.test(cat)) return "no_operativo";
  if(CAT_REPOSICION.has(cat)) return "reposicion";
  return "consumido";
};
const GRUPO_LABEL={reposicion:"Reposición de inventario",consumido:"Gasto real consumido",no_operativo:"No operativo"};
const GRUPO_COLOR={reposicion:C.cyan,consumido:C.red,no_operativo:C.muted};

const Card=({children,style,accent,floating})=><div style={{background:C.card,borderRadius:20,border:`1px solid ${C.bdr}`,padding:20,marginBottom:16,boxShadow:floating!==false?"0 10px 30px rgba(0,0,0,0.5)":"none",...(accent?{borderLeft:`3px solid ${accent}`}:{}),...style}}>{children}</div>;
const Sec=({children,color})=><div style={{fontSize:13,color:color||C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:14,fontWeight:700}}>{children}</div>;

export default function App(){
  const [cuadres,setCuadres]=useState([]);
  const [inventarios,setInventarios]=useState([]);
  const [cocinaData,setCocinaData]=useState([]);
  const [gastosData,setGastosData]=useState([]);
  const [gastosTransfData,setGastosTransfData]=useState([]);
  const [view,setView]=useState("dashboard");
  const [selDate,setSelDate]=useState("2026-08-08");
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    (async()=>{
      try{
        const [sc,si,sk,sg,sgt]=await Promise.all([
          window.storage.get(SK.c).catch(()=>null),window.storage.get(SK.i).catch(()=>null),
          window.storage.get(SK.k).catch(()=>null),window.storage.get(SK.g).catch(()=>null),
          window.storage.get(SK.gt).catch(()=>null),
        ]);
        const merge=(st,pre,kf)=>{const s=st?.value?JSON.parse(st.value):[];const ks=new Set(s.map(kf));return[...s,...pre.filter(p=>!ks.has(kf(p)))].sort((a,b)=>(a.date||"").localeCompare(b.date||""));};
        setCuadres(merge(sc,PRELOADED_CUADRES,c=>c.date));
        setInventarios(merge(si,PRELOADED_INVENTARIOS,i=>`${i.date}_${i.tipo}`));
        setCocinaData(merge(sk,PRELOADED_COCINA,k=>k.date));
        setGastosData(merge(sg,PRELOADED_GASTOS,g=>g.date));
        setGastosTransfData(merge(sgt,PRELOADED_GASTOS_TRANSFERENCIA,g=>`${g.date}_${g.concepto}`));
      }catch{
        setCuadres([...PRELOADED_CUADRES]);setInventarios([...PRELOADED_INVENTARIOS]);
        setCocinaData([...PRELOADED_COCINA]);setGastosData([...PRELOADED_GASTOS]);
        setGastosTransfData([...PRELOADED_GASTOS_TRANSFERENCIA]);
      }
      setLoading(false);
    })();
  },[]);

  const c=useMemo(()=>cuadres.find(x=>x.date===selDate),[cuadres,selDate]);
  const fin=useMemo(()=>inventarios.find(x=>x.date===selDate&&x.tipo==="final"),[inventarios,selDate]);
  const prevFin=useMemo(()=>{
    const sorted=[...inventarios].filter(x=>x.tipo==="final"&&x.date<selDate).sort((a,b)=>b.date.localeCompare(a.date));
    return sorted[0]||null;
  },[inventarios,selDate]);
  const coc=useMemo(()=>cocinaData.find(x=>x.date===selDate),[cocinaData,selDate]);
  const gas=useMemo(()=>gastosData.find(x=>x.date===selDate),[gastosData,selDate]);

  const invCross=useMemo(()=>{
    if(!fin) return null;
    const diffs=[];
    fin.items.forEach(f=>{
      const prev=prevFin?.items?.find(x=>x.nombre===f.nombre);
      const sI=prev?.saldo||0;const sF=f.saldo||0;
      const consumo=sI-sF;
      if(consumo>0||sI>0||sF>0) diffs.push({nombre:f.nombre,ini:sI,ent:0,fin:sF,consumo:Math.max(0,consumo)});
    });
    return diffs.sort((a,b)=>b.consumo-a.consumo);
  },[fin,prevFin]);

  const dates=useMemo(()=>{
    const s=new Set([...cuadres.map(x=>x.date),...cocinaData.map(x=>x.date),...gastosData.map(x=>x.date)]);
    return[...s].sort().reverse();
  },[cuadres,cocinaData,gastosData]);

  if(loading) return <div style={{background:`linear-gradient(135deg, ${C.bg} 0%, #14110d 50%, ${C.bg} 100%)`,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:C.gold,fontFamily:"'Poppins',sans-serif",fontSize:24,fontWeight:800}}>Cargando...</div></div>;

  const tabs=[{id:"dashboard",l:"Dashboard",i:"📊"},{id:"resreal",l:"Resultado Real",i:"🧮"},{id:"invdash",l:"Inv. Control",i:"🔄"},{id:"invvalue",l:"Inv. Valorizado",i:"💰"},{id:"analcat",l:"Por Categoría",i:"📈"},{id:"compras",l:"Compras",i:"🧾"},{id:"bar",l:"Bar",i:"🍸"},{id:"resumen",l:"Día",i:"◉"},{id:"cocina",l:"Cocina",i:"🍕"},{id:"inventario",l:"Inventario",i:"📦"},{id:"gastos",l:"Gastos",i:"📋"}];

  return(
    <div style={{background:`linear-gradient(135deg, ${C.bg} 0%, #14110d 50%, ${C.bg} 100%)`,backgroundAttachment:"fixed",minHeight:"100vh",fontFamily:"'Poppins',sans-serif",color:C.text}}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes pulse-red { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
        .pulse-dot { animation: pulse-red 1.5s ease-in-out infinite; }
        @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
      `}</style>

      <header style={{background:`linear-gradient(180deg,${C.card}f5 0%,${C.bg}e8 100%)`,backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:`1px solid ${C.bdr}`,padding:"14px 16px",position:"sticky",top:0,zIndex:50}}>
        <div style={{maxWidth:920,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div>
              <h1 style={{fontFamily:"'Poppins',sans-serif",fontSize:26,fontWeight:800,color:C.gold,margin:0,letterSpacing:0.5}}>La Sala</h1>
              <p style={{fontSize:12,color:C.dim,margin:"2px 0 0",letterSpacing:2,textTransform:"uppercase",fontWeight:500}}>Control de ventas · Mayo 2026</p>
            </div>
          </div>
          <div style={{display:"flex",gap:4,overflowX:"auto"}}>
            {tabs.map(t=><button key={t.id} onClick={()=>setView(t.id)} style={{
              background:view===t.id?C.gold:"transparent",color:view===t.id?C.bg:C.dim,
              border:`1px solid ${view===t.id?C.gold:C.bdr}`,borderRadius:8,padding:"9px 14px",
              cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",whiteSpace:"nowrap"
            }}><span style={{marginRight:4}}>{t.i}</span>{t.l}</button>)}
          </div>
        </div>
      </header>

      {view!=="dashboard"&&view!=="resreal"&&view!=="invdash"&&view!=="invvalue"&&view!=="analcat"&&view!=="compras"&&<div style={{maxWidth:920,margin:"0 auto",padding:"10px 16px",display:"flex",gap:6,overflowX:"auto",alignItems:"center"}}>
        <span style={{fontSize:14,color:C.dim,letterSpacing:1,textTransform:"uppercase",whiteSpace:"nowrap"}}>Día:</span>
        {dates.map(d=><button key={d} onClick={()=>setSelDate(d)} style={{
          background:selDate===d?C.goldDim+"50":"transparent",color:selDate===d?C.gold:C.muted,
          border:`1px solid ${selDate===d?C.goldDim:"transparent"}`,borderRadius:6,padding:"6px 12px",
          cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:"inherit",whiteSpace:"nowrap"
        }}>{fmtD(d)}</button>)}
      </div>}

      <div style={{maxWidth:920,margin:"0 auto",padding:"0 16px 60px"}}>
        {view==="dashboard"&&<DashboardGeneral cuadres={cuadres} cocina={cocinaData} gastos={gastosData} gastosTransf={gastosTransfData} inventarios={inventarios} bar={PRELOADED_BAR}/>}
        {view==="resreal"&&<ResultadoReal cuadres={cuadres} gastos={gastosData} gastosTransf={gastosTransfData}/>}
        {view==="invdash"&&<InventarioDashboard inventarios={inventarios} cuadres={cuadres}/>}
        {view==="invvalue"&&<InventarioValorizado inventarios={inventarios}/>}
        {view==="analcat"&&<AnalisisCategoria inventarios={inventarios} cocina={cocinaData}/>}
        {view==="compras"&&<ComprasModule compras={PRELOADED_COMPRAS} cartera={PRELOADED_CARTERA}/>}
        {view==="bar"&&<BarModule bar={PRELOADED_BAR} cuadres={cuadres} catalog={CATALOG}/>}
        {view==="resumen"&&<Resumen c={c} coc={coc} gas={gas} cross={invCross} date={selDate}/>}
        {view==="cocina"&&<Cocina coc={coc} date={selDate}/>}
        {view==="inventario"&&<Inventario cross={invCross} prevFin={prevFin} fin={fin} date={selDate}/>}
        {view==="gastos"&&<Gastos gas={gas} date={selDate}/>}
      </div>
    </div>
  );
}

// ─── Dashboard General (Consolidado + Meta) ───
function ResultadoReal({cuadres,gastos,gastosTransf}){
  const monthLabels={"2026-03":"Marzo","2026-04":"Abril","2026-05":"Mayo","2026-06":"Junio","2026-07":"Julio","2026-08":"Agosto","2026-09":"Septiembre","2026-10":"Octubre","2026-11":"Noviembre","2026-12":"Diciembre","2027-01":"Enero","2027-02":"Febrero"};
  const allMonths=[...new Set(cuadres.map(c=>c.date.slice(0,7)))].sort();
  const [activeMonth,setActiveMonth]=useState(allMonths[allMonths.length-1]||"2026-05");

  const cm=cuadres.filter(c=>c.date.startsWith(activeMonth));
  const gtm=(gastosTransf||[]).filter(g=>g.date.startsWith(activeMonth));

  if(cm.length===0) return <div style={{textAlign:"center",padding:60,color:C.dim}}><div style={{fontSize:52,marginBottom:14}}>🧮</div><p style={{fontSize:20,fontWeight:600}}>Sin datos para {monthLabels[activeMonth]||activeMonth}</p>{allMonths.length>0&&<div style={{marginTop:20,display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>{allMonths.map(m=><button key={m} onClick={()=>setActiveMonth(m)} style={{background:m===activeMonth?C.gold:"transparent",color:m===activeMonth?C.bg:C.gold,border:`1px solid ${C.gold}`,padding:"6px 14px",borderRadius:8,fontWeight:600,cursor:"pointer"}}>{monthLabels[m]||m}</button>)}</div>}</div>;

  // ─── Margen de contribución (lo que mide el cuadre) ───
  const t=cm.reduce((a,c)=>{
    a.venta+=c.venta_total||0;a.p80+=c.pizza_80||0;a.gastos+=c.gastos||0;
    a.nomina+=c.nomina||0;a.cf+=c.costo_financiero||0;a.neto+=c.neto_sala||0;
    return a;
  },{venta:0,p80:0,gastos:0,nomina:0,cf:0,neto:0});
  const margenContrib=t.neto; // venta - p80 - gastos cuadre - nomina cuadre - cf

  // ─── Transferencias clasificadas ───
  const grupos={reposicion:{total:0,cats:{},items:[]},consumido:{total:0,cats:{},items:[]},no_operativo:{total:0,cats:{},items:[]}};
  gtm.forEach(g=>{
    const grp=clasificaGasto(g.categoria);
    grupos[grp].total+=g.valor||0;
    grupos[grp].cats[g.categoria]=(grupos[grp].cats[g.categoria]||0)+(g.valor||0);
    grupos[grp].items.push(g);
  });
  const reposicion=grupos.reposicion.total;
  const consumido=grupos.consumido.total;
  const noOperativo=grupos.no_operativo.total;

  // ─── Resultado operativo real ───
  // El margen de contribución NO resta transferencias. El consumido SÍ se resta
  // (no vuelve). La reposición NO se resta (queda como activo en bodega).
  const resultadoReal=margenContrib-consumido;
  const margenRealPct=t.venta?(resultadoReal/t.venta*100):0;
  const margenContribPct=t.venta?(margenContrib/t.venta*100):0;

  const Line=({label,val,color,bold,indent,note})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"7px 0",borderBottom:`1px solid ${C.bdr}`,paddingLeft:indent?16:0}}>
      <span style={{fontSize:bold?15:13,color:color||(bold?C.text:C.dim),fontWeight:bold?700:500}}>{label}{note&&<span style={{fontSize:11,color:C.muted,marginLeft:8}}>{note}</span>}</span>
      <span style={{fontSize:bold?17:14,color:color||(bold?C.text:C.dim),fontWeight:bold?800:600,fontVariantNumeric:"tabular-nums"}}>{val<0?"−":""}{fmtF(Math.abs(val))}</span>
    </div>
  );

  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {allMonths.map(m=><button key={m} onClick={()=>setActiveMonth(m)} style={{background:m===activeMonth?C.gold:"transparent",color:m===activeMonth?C.bg:C.gold,border:`1px solid ${C.gold}`,padding:"7px 16px",borderRadius:8,fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>{monthLabels[m]||m}</button>)}
      </div>

      {/* Resultado destacado */}
      <Card accent={resultadoReal>=0?C.green:C.red}>
        <Sec color={C.gold}>🧮 Resultado Operativo Real · {monthLabels[activeMonth]||activeMonth} ({cm.length} días)</Sec>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:8}}>
          <div style={{background:C.bg,borderRadius:14,padding:16,border:`1px solid ${C.bdr}`}}>
            <div style={{fontSize:12,color:C.dim,textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>Margen de contribución</div>
            <div style={{fontSize:26,fontWeight:800,color:C.gold,marginTop:6,fontVariantNumeric:"tabular-nums"}}>{fmtF(margenContrib)}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>{margenContribPct.toFixed(1)}% s/ venta · lo que mide el cuadre</div>
          </div>
          <div style={{background:C.bg,borderRadius:14,padding:16,border:`1px solid ${resultadoReal>=0?C.greenDim:C.redDim}`}}>
            <div style={{fontSize:12,color:C.dim,textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>Resultado operativo real</div>
            <div style={{fontSize:26,fontWeight:800,color:resultadoReal>=0?C.green:C.red,marginTop:6,fontVariantNumeric:"tabular-nums"}}>{resultadoReal<0?"−":""}{fmtF(Math.abs(resultadoReal))}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>{margenRealPct.toFixed(1)}% s/ venta · descontando lo consumido</div>
          </div>
        </div>
      </Card>

      {/* Cascada del cálculo */}
      <Card>
        <Sec>Cascada del resultado</Sec>
        <Line label="Venta total" val={t.venta} bold/>
        <Line label="(−) Pago 80% pizza (cocina/aliado)" val={-t.p80}/>
        <Line label="(−) Gastos diarios (en cuadre)" val={-t.gastos}/>
        <Line label="(−) Nómina (en cuadre)" val={-t.nomina}/>
        <Line label="(−) Costo financiero (5% tarjeta)" val={-t.cf}/>
        <Line label="= Margen de contribución" val={margenContrib} color={C.gold} bold/>
        <div style={{height:10}}/>
        <Line label="(−) Gasto real consumido (transferencias)" val={-consumido} color={C.red} note="no vuelve"/>
        <Line label="= RESULTADO OPERATIVO REAL" val={resultadoReal} color={resultadoReal>=0?C.green:C.red} bold/>
        <div style={{marginTop:12,padding:"10px 14px",background:C.cyan+"14",border:`1px solid ${C.cyan}40`,borderRadius:10,fontSize:12.5,color:C.text,lineHeight:1.5}}>
          <b style={{color:C.cyan}}>+ {fmtF(reposicion)}</b> en reposición de inventario <b>NO</b> se resta aquí: es stock embotellado que sigue en bodega (activo recuperable). Se realiza como costo solo al venderse, vía el inventario valorizado. {noOperativo>0&&<><br/><span style={{color:C.muted}}>{fmtF(noOperativo)} clasificado como no operativo (préstamos) — excluido del resultado.</span></>}
        </div>
      </Card>

      {/* Desglose de transferencias por grupo */}
      {["reposicion","consumido","no_operativo"].filter(g=>grupos[g].total>0).map(g=>(
        <Card key={g} accent={GRUPO_COLOR[g]}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:12}}>
            <Sec color={GRUPO_COLOR[g]}>{g==="reposicion"?"📦 ":g==="consumido"?"🔴 ":"⚪ "}{GRUPO_LABEL[g]}</Sec>
            <span style={{fontSize:20,fontWeight:800,color:GRUPO_COLOR[g],fontVariantNumeric:"tabular-nums"}}>{fmtF(grupos[g].total)}</span>
          </div>
          {g==="no_operativo"?(
            // Detalle ítem por ítem para No operativo (típicamente pocas entradas, c/u es relevante)
            <>
              <div style={{display:"grid",gridTemplateColumns:"70px 1fr auto",gap:10,fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:0.8,fontWeight:600,paddingBottom:6,borderBottom:`1px solid ${C.bdr}`}}>
                <span>Fecha</span><span>Concepto</span><span style={{textAlign:"right"}}>Valor</span>
              </div>
              {grupos[g].items.slice().sort((a,b)=>a.date.localeCompare(b.date)).map((it,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"70px 1fr auto",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.bdr}40`,fontSize:13,alignItems:"baseline"}}>
                  <span style={{color:C.muted,fontVariantNumeric:"tabular-nums",fontSize:12}}>{fmtD(it.date).replace(" 2026","")}</span>
                  <span style={{color:C.text}}>{it.concepto}<span style={{display:"block",fontSize:10,color:C.muted,marginTop:2,letterSpacing:0.3}}>{it.categoria}</span></span>
                  <span style={{color:C.text,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmtF(it.valor||0)}</span>
                </div>
              ))}
            </>
          ):(
            // Desglose por categoría para Reposición y Consumido (muchas entradas, más útil agrupado)
            Object.entries(grupos[g].cats).sort((a,b)=>b[1]-a[1]).map(([cat,v])=>(
              <div key={cat} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.bdr}`,fontSize:13}}>
                <span style={{color:C.dim}}>{cat}</span>
                <span style={{color:C.text,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmtF(v)}</span>
              </div>
            ))
          )}
          {g==="reposicion"&&<div style={{fontSize:11.5,color:C.muted,marginTop:10,lineHeight:1.5}}>Compra de licor/cerveza/gaseosa que ingresa a bodega. Activo recuperable: se convierte en costo solo cuando se vende.</div>}
          {g==="consumido"&&<div style={{fontSize:11.5,color:C.muted,marginTop:10,lineHeight:1.5}}>Nómina, eventos, servicios, perecederos e insumos consumibles. Dinero que sale y no genera activo en bodega.</div>}
          {g==="no_operativo"&&<div style={{fontSize:11.5,color:C.muted,marginTop:10,lineHeight:1.5}}>Préstamos, activos fijos (CAPEX) y movimientos que no son gasto operativo. Salidas de caja informativas, excluidas del resultado operativo del negocio.</div>}
        </Card>
      ))}

      {/* Comparativo mensual */}
      {allMonths.length>1&&<Card>
        <Sec>Comparativo mensual</Sec>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{color:C.dim,textAlign:"right"}}>
              <th style={{textAlign:"left",padding:"8px 6px",fontWeight:600}}>Mes</th>
              <th style={{padding:"8px 6px",fontWeight:600}}>Venta</th>
              <th style={{padding:"8px 6px",fontWeight:600}}>Margen contrib.</th>
              <th style={{padding:"8px 6px",fontWeight:600}}>Consumido</th>
              <th style={{padding:"8px 6px",fontWeight:600}}>Result. real</th>
            </tr></thead>
            <tbody>
              {allMonths.map(m=>{
                const mc=cuadres.filter(c=>c.date.startsWith(m));
                const mg=(gastosTransf||[]).filter(x=>x.date.startsWith(m));
                const v=mc.reduce((s,c)=>s+(c.venta_total||0),0);
                const mar=mc.reduce((s,c)=>s+(c.neto_sala||0),0);
                const cons=mg.reduce((s,x)=>s+(clasificaGasto(x.categoria)==="consumido"?(x.valor||0):0),0);
                const rr=mar-cons;
                return(<tr key={m} style={{borderTop:`1px solid ${C.bdr}`,color:C.text}}>
                  <td style={{textAlign:"left",padding:"8px 6px",fontWeight:m===activeMonth?700:500,color:m===activeMonth?C.gold:C.text}}>{monthLabels[m]||m}</td>
                  <td style={{textAlign:"right",padding:"8px 6px",fontVariantNumeric:"tabular-nums"}}>{fmtF(v)}</td>
                  <td style={{textAlign:"right",padding:"8px 6px",color:C.gold,fontVariantNumeric:"tabular-nums"}}>{fmtF(mar)}</td>
                  <td style={{textAlign:"right",padding:"8px 6px",color:C.red,fontVariantNumeric:"tabular-nums"}}>{fmtF(cons)}</td>
                  <td style={{textAlign:"right",padding:"8px 6px",fontWeight:700,color:rr>=0?C.green:C.red,fontVariantNumeric:"tabular-nums"}}>{rr<0?"−":""}{fmtF(Math.abs(rr))}</td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
      </Card>}
    </div>
  );
}

function DashboardGeneral({cuadres,cocina,gastos,gastosTransf,inventarios,bar}){
  const META=45000000;
  const DIAS_MES=31;

  // Mes activo: por defecto el mes más reciente con datos
  const allMonths=[...new Set(cuadres.map(c=>c.date.slice(0,7)))].sort();
  const [activeMonth,setActiveMonth]=useState(allMonths[allMonths.length-1]||"2026-05");
  const monthLabels={"2026-03":"Marzo","2026-04":"Abril","2026-05":"Mayo","2026-06":"Junio","2026-07":"Julio","2026-08":"Agosto","2026-09":"Septiembre","2026-10":"Octubre","2026-11":"Noviembre","2026-12":"Diciembre","2027-01":"Enero","2027-02":"Febrero"};

  // Filter all data by active month
  const cuadresMonth=cuadres.filter(c=>c.date.startsWith(activeMonth));
  const gastosTransfMonth=(gastosTransf||[]).filter(g=>g.date.startsWith(activeMonth));

  if(cuadresMonth.length===0) return <div style={{textAlign:"center",padding:60,color:C.dim}}><div style={{fontSize:52,marginBottom:14}}>📊</div><p style={{fontSize:20,fontWeight:600}}>Sin datos para {monthLabels[activeMonth]||activeMonth}</p><p style={{fontSize:14}}>Envía las fotos del POS a Claude para registrar</p>{allMonths.length>0&&<div style={{marginTop:20,display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>{allMonths.map(m=><button key={m} onClick={()=>setActiveMonth(m)} style={{background:m===activeMonth?C.gold:"transparent",color:m===activeMonth?C.bg:C.gold,border:`1px solid ${C.gold}`,padding:"6px 14px",borderRadius:8,fontWeight:600,cursor:"pointer"}}>{monthLabels[m]||m}</button>)}</div>}</div>;

  const tot=cuadresMonth.reduce((a,c)=>{
    a.venta+=c.venta_total;a.estanco+=c.estanco||0;a.cocteles+=c.cocteles||0;
    a.pizza+=c.pizzeria||0;a.efectivo+=c.efectivo;a.tarjeta+=c.tarjeta;
    a.otros+=(c.otros_pago||0);a.p80+=c.pizza_80;a.gastos+=c.gastos;
    a.nomina+=c.nomina;a.cf+=(c.costo_financiero||0);a.neto+=c.neto_sala||0;
    return a;
  },{venta:0,estanco:0,cocteles:0,pizza:0,efectivo:0,tarjeta:0,otros:0,p80:0,gastos:0,nomina:0,cf:0,neto:0});

  const totalGastos=tot.p80+tot.gastos+tot.nomina+tot.cf;
  const totalTransf=gastosTransfMonth.reduce((a,g)=>a+(g.valor||0),0);
  const netoReal=tot.neto-totalTransf;
  const totalGastosReal=totalGastos+totalTransf;

  // ─── ACUMULADO CONSOLIDADO (todos los meses con datos) ───
  const totAcum=cuadres.reduce((a,c)=>{
    a.venta+=c.venta_total;
    a.neto+=c.neto_sala||0;
    a.cf+=c.costo_financiero||0;
    return a;
  },{venta:0,neto:0,cf:0});
  const totalTransfAcum=(gastosTransf||[]).reduce((a,g)=>a+(g.valor||0),0);
  const netoRealAcum=totAcum.neto-totalTransfAcum;
  // Desglose mensual para mostrar el detalle
  const monthBreakdown=allMonths.map(m=>{
    const cm=cuadres.filter(c=>c.date.startsWith(m));
    const gm=(gastosTransf||[]).filter(g=>g.date.startsWith(m));
    const venta=cm.reduce((s,c)=>s+c.venta_total,0);
    const netoPos=cm.reduce((s,c)=>s+(c.neto_sala||0),0);
    const transf=gm.reduce((s,g)=>s+(g.valor||0),0);
    return{mes:m,label:monthLabels[m]||m,dias:cm.length,venta,netoPos,transf,netoReal:netoPos-transf};
  });
  const avgDay=tot.venta/cuadresMonth.length;
  // mayo tiene 31 días, abril 30, marzo 31
  const daysInMonth={"2026-03":31,"2026-04":30,"2026-05":31,"2026-06":30,"2026-07":31,"2026-08":31,"2026-09":30,"2026-10":31,"2026-11":30,"2026-12":31}[activeMonth]||31;
  const proyeccion=avgDay*daysInMonth;
  const pctMeta=tot.venta/META;
  const diasRestantes=daysInMonth-cuadresMonth.length;
  const faltaMeta=META-tot.venta;
  const necesitaDia=diasRestantes>0?faltaMeta/diasRestantes:0;
  const barPct=tot.venta?(tot.estanco+tot.cocteles)/tot.venta:0;
  const margenPct=tot.venta?(tot.neto/tot.venta):0;
  const margenRealPct=tot.venta?(netoReal/tot.venta):0;

  const best=cuadresMonth.reduce((a,b)=>a.venta_total>b.venta_total?a:b);
  const worst=cuadresMonth.reduce((a,b)=>a.venta_total<b.venta_total?a:b);

  const chartData=cuadresMonth.map(c=>{
    const vt=c.venta_total||1;
    return{
      d:fmtD(c.date).split(" ").slice(0,2).join(" "),
      venta:c.venta_total,estanco:c.estanco||0,cocteles:c.cocteles||0,pizza:c.pizzeria||0,
      neto:c.neto_sala||0,
      pctEst:((c.estanco||0)/vt*100).toFixed(1),
      pctCoc:((c.cocteles||0)/vt*100).toFixed(1),
      pctPiz:((c.pizzeria||0)/vt*100).toFixed(1),
    };
  });

  let acum=0;
  const acumData=cuadresMonth.map((c,i)=>{
    acum+=c.venta_total;
    return{d:fmtD(c.date).split(" ").slice(0,2).join(" "),real:acum,meta:META/daysInMonth*(i+1)};
  });

  // Top kitchen
  const topK={};
  cocina.forEach(d=>(d.productos||[]).forEach(p=>{
    if(!topK[p.nombre])topK[p.nombre]={nombre:p.nombre,qty:0,total:0};
    topK[p.nombre].qty+=p.cantidad||0;topK[p.nombre].total+=p.valor||0;
  }));
  const topKList=Object.values(topK).sort((a,b)=>b.qty-a.qty).slice(0,10);

  // Top licores/cocteles from inventory consumption
  const invConsumo=useMemo(()=>{
    const prods={};
    const finals=inventarios.filter(i=>i.tipo==="final");
    finals.forEach(fin=>{
      const ini=inventarios.find(i=>i.date===fin.date&&i.tipo==="inicial");
      if(!ini)return;
      fin.items.forEach(f=>{
        const iItem=ini.items.find(x=>x.nombre===f.nombre);
        const sI=iItem?.saldo||0;const ent=f.entrada||0;const sF=f.saldo||0;
        const consumo=sI+ent-sF;
        if(consumo>0){
          if(!prods[f.nombre])prods[f.nombre]={nombre:f.nombre,total:0,days:0};
          prods[f.nombre].total+=consumo;prods[f.nombre].days++;
        }
      });
    });
    return Object.values(prods).sort((a,b)=>b.total-a.total);
  },[inventarios]);

  // Classify inventory products
  const licorCats=useMemo(()=>{
    const cocteles=["GINEBRA","VODKA","RON","TEQUILA","WHISKY","LICOR","CURAZAO","DRY MARTINI","TRIPLE SEC","CACHAZA","AMARETO","CREMA DE WHISKY"];
    const cervezas=["CERVEZA","CORONA"];
    const mixers=["GASEOSA","AGUA TONICA","RED BULL","ELECTROLIT","AGUA"];
    const classify=(name)=>{
      const u=name.toUpperCase();
      if(cervezas.some(c=>u.includes(c)))return"Cervezas";
      if(cocteles.some(c=>u.includes(c)))return"Licores/Cocteles";
      if(mixers.some(c=>u.includes(c)))return"Mixers/Bebidas";
      if(u.includes("AGTE"))return"Aguardiente";
      if(u.includes("VINO"))return"Vinos";
      return"Otros";
    };
    const cats={};
    invConsumo.forEach(p=>{
      const cat=classify(p.nombre);
      if(!cats[cat])cats[cat]=[];
      cats[cat].push(p);
    });
    return cats;
  },[invConsumo]);

  // Gastos by category
  const expCats={};
  gastos.forEach(d=>(d.items||[]).forEach(it=>{
    const cat=it.categoria||"Varios";
    expCats[cat]=(expCats[cat]||0)+(it.valor||0);
  }));
  const expList=Object.entries(expCats).sort((a,b)=>b[1]-a[1]).map(([name,value],i)=>({name,value,fill:PIE[i%PIE.length]}));

  // Day of week
  const dowData=[0,1,2,3,4,5,6].map(dow=>{
    const de=cuadresMonth.filter(c=>new Date(c.date+"T12:00:00").getDay()===dow);
    return{day:["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][dow],avg:de.length?de.reduce((s,c)=>s+c.venta_total,0)/de.length:0,count:de.length};
  });

  const metaColor=pctMeta>=1?C.green:pctMeta>=0.5?"#fbbf24":C.red;
  const proyColor=proyeccion>=META?C.green:proyeccion>=META*0.85?"#fbbf24":C.red;

  // Custom tooltip with percentages — glassmorphism style
  const DailyTooltip=({active,payload,label})=>{
    if(!active||!payload?.length)return null;
    const d=payload[0]?.payload;
    return(<div style={{background:`${C.card}d0`,backdropFilter:"blur(14px) saturate(180%)",WebkitBackdropFilter:"blur(14px) saturate(180%)",border:`1px solid ${C.gold}30`,borderRadius:14,padding:"12px 16px",fontSize:12,boxShadow:"0 12px 36px rgba(0,0,0,0.7)"}}>
      <div style={{color:C.gold,fontWeight:800,marginBottom:8,fontSize:14,letterSpacing:0.5}}>{label}</div>
      <div style={{marginBottom:5}}>Total: <strong style={{color:C.text,fontWeight:700}}>{fmtF(d?.venta)}</strong></div>
      <div style={{color:C.gold,marginBottom:2}}>● Estanco: {fmtF(d?.estanco)} <span style={{color:C.muted}}>({d?.pctEst}%)</span></div>
      <div style={{color:C.cyan,marginBottom:2}}>● Cocteles: {fmtF(d?.cocteles)} <span style={{color:C.muted}}>({d?.pctCoc}%)</span></div>
      <div style={{color:C.orange,marginBottom:2}}>● Pizzería: {fmtF(d?.pizza)} <span style={{color:C.muted}}>({d?.pctPiz}%)</span></div>
      <div style={{marginTop:6,paddingTop:6,borderTop:`1px solid ${C.bdr}`,color:d?.neto>=0?C.green:C.red,fontWeight:700}}>Neto: {fmtF(d?.neto)}</div>
    </div>);
  };

  // Ranking renderer
  const RankList=({items,color,unit})=>(
    <div>{items.map((p,i)=>{
      const mx=items[0]?.total||items[0]?.qty||1;
      const val=p.total||p.qty;
      return(<div key={i} style={{marginBottom:5}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:2}}>
          <span><span style={{color:i<3?C.gold:C.dim,fontWeight:700,marginRight:6}}>{i+1}.</span>{p.nombre}</span>
          <span style={{color,fontWeight:600}}>{val} {unit||"uds"}</span>
        </div>
        <div style={{background:C.bdr,borderRadius:3,height:5}}>
          <div style={{background:color,height:"100%",width:`${(val/mx)*100}%`,borderRadius:3}}/>
        </div>
      </div>);
    })}</div>
  );

  return(<div>
    {/* ═══ META MENSUAL ═══ */}
    <Card style={{background:`linear-gradient(135deg,${C.card} 0%,#1a1510 100%)`,padding:22,marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div>
          <div style={{fontSize:12,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>Meta mayo</div>
          <div style={{fontSize:32,fontWeight:800,color:C.gold,marginTop:4}}>{fmtF(META)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:12,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>Avance</div>
          <div style={{fontSize:32,fontWeight:800,color:metaColor,marginTop:4}}>{(pctMeta*100).toFixed(1)}%</div>
        </div>
      </div>
      <div style={{background:C.bdr,borderRadius:10,height:22,overflow:"hidden",marginBottom:10,position:"relative"}}>
        <div style={{background:`linear-gradient(90deg,${C.goldDim},${C.gold})`,height:"100%",width:`${Math.min(pctMeta*100,100)}%`,borderRadius:10,transition:"width 0.8s ease"}}/>
        <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}>{fmtF(tot.venta)} / {fmtF(META)}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        <div style={{background:C.bg,borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
          <div style={{fontSize:11,color:C.dim,marginBottom:3}}>Faltan</div>
          <div style={{fontSize:17,fontWeight:700,color:faltaMeta>0?C.gold:C.green}}>{faltaMeta>0?fmtF(faltaMeta):"✓ CUMPLIDA"}</div>
        </div>
        <div style={{background:C.bg,borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
          <div style={{fontSize:11,color:C.dim,marginBottom:3}}>Necesita/día</div>
          <div style={{fontSize:17,fontWeight:700,color:necesitaDia<=avgDay?C.green:necesitaDia<=avgDay*1.3?"#fbbf24":C.red}}>{diasRestantes>0?fmtF(necesitaDia):"—"}</div>
        </div>
        <div style={{background:C.bg,borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
          <div style={{fontSize:11,color:C.dim,marginBottom:3}}>Proyección</div>
          <div style={{fontSize:17,fontWeight:700,color:proyColor}}>{fmtF(proyeccion)}</div>
        </div>
      </div>
      <div style={{marginTop:10,padding:"8px 12px",background:(proyeccion>=META?C.green:C.red)+"15",borderRadius:8,fontSize:13,color:proyeccion>=META?C.green:C.red,textAlign:"center",fontWeight:600}}>
        {proyeccion>=META
          ?`✓ Al ritmo actual (${fmtF(avgDay)}/día) se proyecta superar la meta por ${fmtF(proyeccion-META)}`
          :`⚠ Al ritmo actual (${fmtF(avgDay)}/día) faltarían ${fmtF(META-proyeccion)} — necesita subir a ${fmtF(necesitaDia)}/día`}
      </div>
    </Card>

    {/* ═══ Selector de mes ═══ */}
    {allMonths.length>1&&<div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
      <span style={{fontSize:11,color:C.dim,letterSpacing:2,textTransform:"uppercase",fontWeight:600,marginRight:6}}>Mes</span>
      {allMonths.map(m=>(
        <button key={m} onClick={()=>setActiveMonth(m)} style={{
          background:m===activeMonth?C.gold:"transparent",
          color:m===activeMonth?C.bg:C.gold,
          border:`1px solid ${m===activeMonth?C.gold:C.gold+"60"}`,
          padding:"5px 14px",borderRadius:8,fontSize:12,fontWeight:600,
          cursor:"pointer",fontFamily:"'Poppins',sans-serif",letterSpacing:.5,
          transition:"all 0.2s"
        }}>{monthLabels[m]||m}</button>
      ))}
    </div>}

    {/* ═══ ACUMULADO CONSOLIDADO (multi-mes) ═══ */}
    {allMonths.length>1&&<Card accent={C.green} style={{background:`linear-gradient(135deg, ${(netoRealAcum>=0?C.green:C.red)}12 0%, ${C.card} 60%)`,boxShadow:`0 12px 40px ${(netoRealAcum>=0?C.green:C.red)}20`,borderWidth:2}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,gap:10,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:11,color:C.gold,textTransform:"uppercase",letterSpacing:2.5,fontWeight:700}}>● Acumulado consolidado</div>
          <div style={{fontSize:13,color:C.dim,marginTop:4}}>Saldo histórico de los {allMonths.length} meses con datos</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600}}>Neto REAL acumulado</div>
          <div style={{fontSize:30,fontWeight:800,color:netoRealAcum>=0?C.green:C.red,fontFamily:"'Poppins',sans-serif",letterSpacing:-0.5,lineHeight:1.1,marginTop:4}}>{fmtF(netoRealAcum)}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>sobre {fmtF(totAcum.venta)} de venta total</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${monthBreakdown.length+1},1fr)`,gap:8}}>
        {monthBreakdown.map((m,i)=>(
          <div key={i} style={{background:m.mes===activeMonth?C.bg:C.card,padding:"10px 12px",borderRadius:10,border:`1px solid ${m.mes===activeMonth?C.gold+"60":C.bdr}`,position:"relative"}}>
            <div style={{fontSize:10,color:m.mes===activeMonth?C.gold:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>{m.label}</div>
            <div style={{fontSize:9,color:C.muted,marginTop:1}}>{m.dias} días · {fmtF(m.venta)}</div>
            <div style={{fontSize:16,fontWeight:800,color:m.netoReal>=0?C.green:C.red,marginTop:6,fontFamily:"'Poppins',sans-serif",letterSpacing:-0.3}}>{fmtF(m.netoReal)}</div>
            <div style={{fontSize:9,color:C.muted,marginTop:2,display:"flex",justifyContent:"space-between"}}>
              <span>POS {fmtF(m.netoPos)}</span>
              <span style={{color:C.purple}}>−T {fmtF(m.transf)}</span>
            </div>
          </div>
        ))}
        <div style={{background:`linear-gradient(135deg, ${(netoRealAcum>=0?C.green:C.red)}25 0%, ${C.bg} 100%)`,padding:"10px 12px",borderRadius:10,border:`2px solid ${netoRealAcum>=0?C.green:C.red}`,position:"relative"}}>
          <div style={{fontSize:10,color:C.gold,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>Σ Total</div>
          <div style={{fontSize:9,color:C.muted,marginTop:1}}>{cuadres.length} días · {fmtF(totAcum.venta)}</div>
          <div style={{fontSize:16,fontWeight:800,color:netoRealAcum>=0?C.green:C.red,marginTop:6,fontFamily:"'Poppins',sans-serif",letterSpacing:-0.3}}>{fmtF(netoRealAcum)}</div>
          <div style={{fontSize:9,color:C.muted,marginTop:2}}>margen real {totAcum.venta?(netoRealAcum/totAcum.venta*100).toFixed(1):"0"}%</div>
        </div>
      </div>
    </Card>}

    {/* ═══ KPIs ═══ */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:14}}>
      {[
        {l:"Venta acumulada",v:fmtF(tot.venta),s:`${cuadresMonth.length} días`,c:C.gold},
        {l:"Promedio diario",v:fmtF(avgDay),s:`meta: ${fmtF(META/daysInMonth)}/día`,c:avgDay>=META/daysInMonth?C.green:"#fbbf24"},
        {l:"Estanco",v:fmtF(tot.estanco),s:pct(tot.estanco,tot.venta),c:C.gold},
        {l:"Cocteles",v:fmtF(tot.cocteles),s:pct(tot.cocteles,tot.venta),c:C.cyan},
        {l:"Pizzería",v:fmtF(tot.pizza),s:pct(tot.pizza,tot.venta),c:C.orange},
        {l:"Neto cuadres POS",v:fmtF(tot.neto),s:`margen ${(margenPct*100).toFixed(1)}%`,c:tot.neto>=0?C.green:C.red},
        {l:"Gastos transferencia",v:fmtF(totalTransf),s:`${(gastosTransfMonth||[]).length} pagos`,c:C.purple},
        {l:"NETO REAL",v:fmtF(netoReal),s:`margen real ${(margenRealPct*100).toFixed(1)}%`,c:netoReal>=0?C.green:C.red},
      ].map((k,i)=>(
        <Card key={i} accent={k.c} style={{padding:"14px 16px",marginBottom:0,...(k.l==="NETO REAL"?{background:`linear-gradient(135deg, ${(netoReal>=0?C.greenDim:C.redDim)}25 0%, ${C.card} 100%)`,borderWidth:2,boxShadow:`0 10px 40px ${(netoReal>=0?C.green:C.red)}25`}:{})}}>
          <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600,marginBottom:6}}>{k.l}</div>
          <div style={{fontSize:20,fontWeight:800,color:k.c,fontFamily:"'Poppins',sans-serif",letterSpacing:-0.3}}>{k.v}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:3}}>{k.s}</div>
        </Card>
      ))}
    </div>

    {/* ═══ ACUMULADO VS META ═══ */}
    <Card>
      <Sec>Acumulado vs meta ideal</Sec>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={acumData}>
          <defs>
            <linearGradient id="gAcum" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.gold} stopOpacity={0.45}/><stop offset="95%" stopColor={C.gold} stopOpacity={0}/></linearGradient>
            <filter id="glowGold" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={C.bdr}/>
          <XAxis dataKey="d" tick={{fill:C.muted,fontSize:11}} axisLine={{stroke:C.bdr}}/>
          <YAxis tick={{fill:C.muted,fontSize:10}} axisLine={{stroke:C.bdr}} tickFormatter={fmt}/>
          <Tooltip formatter={v=>fmtF(v)} contentStyle={{background:`${C.card}d8`,backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",border:`1px solid ${C.gold}40`,borderRadius:12,fontSize:12,boxShadow:"0 8px 24px rgba(0,0,0,0.6)"}}/>
          <Area type="monotone" dataKey="meta" name="Meta ideal" stroke={C.dim} strokeDasharray="5 5" fill="none" strokeWidth={1.5}/>
          <Area type="monotone" dataKey="real" name="Venta real" stroke={C.gold} fill="url(#gAcum)" strokeWidth={4} filter="url(#glowGold)" activeDot={{r:7,stroke:C.gold,strokeWidth:3,fill:C.bg}}/>
        </AreaChart>
      </ResponsiveContainer>
    </Card>

    {/* ═══ VENTA DIARIA CON % EN TOOLTIP ═══ */}
    <Card>
      <Sec>Venta diaria por categoría</Sec>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.bdr}/>
          <XAxis dataKey="d" tick={{fill:C.muted,fontSize:11}} axisLine={{stroke:C.bdr}}/>
          <YAxis tick={{fill:C.muted,fontSize:10}} axisLine={{stroke:C.bdr}} tickFormatter={fmt}/>
          <Tooltip content={<DailyTooltip/>}/>
          <Bar dataKey="estanco" name="Estanco" stackId="a" fill={C.gold}/>
          <Bar dataKey="cocteles" name="Cocteles" stackId="a" fill={C.cyan}/>
          <Bar dataKey="pizza" name="Pizzería" stackId="a" fill={C.orange} radius={[8,8,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </Card>

    {/* ═══ BAR VS COCINA + PAGOS ═══ */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card>
        <Sec>Bar vs cocina</Sec>
        <div style={{display:"flex",height:28,borderRadius:8,overflow:"hidden",marginBottom:8}}>
          <div style={{width:`${barPct*100}%`,background:`linear-gradient(90deg,${C.gold},${C.cyan})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.bg}}>{(barPct*100).toFixed(0)}%</div>
          <div style={{flex:1,background:C.orange,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.bg}}>{((1-barPct)*100).toFixed(0)}%</div>
        </div>
        <div style={{fontSize:12,color:C.dim}}>Bar: {fmtF(tot.estanco+tot.cocteles)} · Cocina: {fmtF(tot.pizza)}</div>
        <div style={{marginTop:6,fontSize:12,padding:"5px 8px",background:(barPct>=.6?C.green:C.red)+"15",borderRadius:6,color:barPct>=.6?C.green:C.red}}>
          {barPct>=.6?"✓ Bar lidera — alineado":"⚠ Cocina pesa más de lo esperado"}
        </div>
      </Card>
      <Card>
        <Sec>Métodos de pago</Sec>
        {[{n:"Tarjeta",v:tot.tarjeta,c:C.blue},{n:"Nequi/Otros",v:tot.otros,c:C.purple},{n:"Efectivo",v:tot.efectivo,c:C.green}].map((p,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.bdr}`,fontSize:13}}>
            <span style={{color:C.dim}}>{p.n}</span>
            <span style={{color:p.c,fontWeight:600}}>{fmtF(p.v)} <span style={{fontSize:11,color:C.muted}}>({pct(p.v,tot.venta)})</span></span>
          </div>
        ))}
      </Card>
      {/* Bar/Coctelería tracking (nuevo) */}
      {(()=>{
        const barMonth=(bar||[]).filter(b=>b.date.startsWith(activeMonth));
        if(barMonth.length===0) return null;
        const totEst=barMonth.reduce((s,b)=>s+(b.total_estanco||0),0);
        const totCoct=barMonth.reduce((s,b)=>s+(b.total_cocteles||0),0);
        const totUnds=barMonth.reduce((s,b)=>s+(b.total_units||0),0);
        const coctMap={};
        barMonth.forEach(b=>(b.cocteles||[]).forEach(p=>{coctMap[p.nombre]=(coctMap[p.nombre]||0)+p.cantidad;}));
        const topCoct=Object.entries(coctMap).sort((a,b)=>b[1]-a[1])[0];
        return(<Card accent={C.gold}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
            <Sec color={C.gold}>🍸 Bar tracking</Sec>
            <span style={{fontSize:11,color:C.muted}}>{barMonth.length} día{barMonth.length===1?"":"s"}</span>
          </div>
          <div style={{display:"flex",gap:10,marginBottom:8}}>
            <div style={{flex:1,padding:"8px 10px",background:C.cyan+"10",borderRadius:6,borderLeft:`2px solid ${C.cyan}`}}>
              <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",fontWeight:700}}>Estanco</div>
              <div style={{fontSize:14,color:C.cyan,fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{fmtF(totEst)}</div>
            </div>
            <div style={{flex:1,padding:"8px 10px",background:C.gold+"10",borderRadius:6,borderLeft:`2px solid ${C.gold}`}}>
              <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",fontWeight:700}}>Cócteles</div>
              <div style={{fontSize:14,color:C.gold,fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{fmtF(totCoct)}</div>
            </div>
          </div>
          {topCoct&&<div style={{fontSize:11.5,color:C.muted,marginTop:4}}>Top coctel: <span style={{color:C.gold,fontWeight:600}}>{topCoct[0]}</span> ({topCoct[1]} uds)</div>}
          <div style={{fontSize:11,color:C.muted,marginTop:4}}>Total: {totUnds} unds vendidas</div>
        </Card>);
      })()}
    </div>

    {/* ═══ TOP LICORES / COCTELES / CERVEZAS (del inventario) ═══ */}
    {invConsumo.length>0&&<>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {licorCats["Licores/Cocteles"]&&licorCats["Licores/Cocteles"].length>0&&<Card>
          <Sec color={C.cyan}>🍸 Top licores / cocteles</Sec>
          <RankList items={licorCats["Licores/Cocteles"].slice(0,8)} color={C.cyan} unit="uds"/>
        </Card>}
        {licorCats["Aguardiente"]&&licorCats["Aguardiente"].length>0&&<Card>
          <Sec color={C.gold}>🥃 Aguardiente</Sec>
          <RankList items={licorCats["Aguardiente"].slice(0,6)} color={C.gold} unit="uds"/>
        </Card>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {licorCats["Cervezas"]&&licorCats["Cervezas"].length>0&&<Card>
          <Sec color={"#fbbf24"}>🍺 Cervezas</Sec>
          <RankList items={licorCats["Cervezas"].slice(0,6)} color={"#fbbf24"} unit="uds"/>
        </Card>}
        {licorCats["Mixers/Bebidas"]&&licorCats["Mixers/Bebidas"].length>0&&<Card>
          <Sec color={C.blue}>🧊 Mixers / Bebidas</Sec>
          <RankList items={licorCats["Mixers/Bebidas"].slice(0,6)} color={C.blue} unit="uds"/>
        </Card>}
      </div>
      {licorCats["Vinos"]&&licorCats["Vinos"].length>0&&<Card>
        <Sec color={C.purple}>🍷 Vinos</Sec>
        <RankList items={licorCats["Vinos"].slice(0,6)} color={C.purple} unit="uds"/>
      </Card>}
    </>}

    {/* ═══ TOP PRODUCTOS COCINA ═══ */}
    {topKList.length>0&&<Card>
      <Sec color={C.orange}>🍕 Top productos cocina — acumulado mes</Sec>
      {topKList.map((p,i)=>{
        const mx=topKList[0]?.qty||1;
        return(<div key={i} style={{marginBottom:5}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:2}}>
            <span><span style={{color:i<3?C.gold:C.dim,fontWeight:700,marginRight:6}}>{i+1}.</span>{p.nombre}</span>
            <span><span style={{color:C.orange,fontWeight:600}}>{p.qty} uds</span> <span style={{color:C.muted,marginLeft:6}}>{fmtF(p.total)}</span></span>
          </div>
          <div style={{background:C.bdr,borderRadius:3,height:5}}>
            <div style={{background:C.orange,height:"100%",width:`${(p.qty/mx)*100}%`,borderRadius:3}}/>
          </div>
        </div>);
      })}
    </Card>}

    {/* ═══ GASTOS ═══ */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card>
        <Sec color={C.red}>Desglose gastos consolidado</Sec>
        {[{n:"Pizza 80%",v:tot.p80,c:C.orange},{n:"Gastos operativos (POS)",v:tot.gastos,c:C.red},{n:"Nómina (caja)",v:tot.nomina,c:C.purple},{n:"Costo financiero (5% tarjeta)",v:tot.cf,c:C.blue},{n:"Gastos por transferencia",v:totalTransf,c:C.pink}].map((e,i)=>(
          <div key={i} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:3}}><span>{e.n}</span><span style={{color:e.c,fontWeight:600}}>{fmtF(e.v)}</span></div>
            <div style={{background:C.bdr,borderRadius:3,height:6}}><div style={{background:e.c,height:"100%",width:`${totalGastosReal?(e.v/totalGastosReal)*100:0}%`,borderRadius:3}}/></div>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:700,paddingTop:8,borderTop:`1px solid ${C.bdr}`}}><span>Total gastos</span><span style={{color:C.red}}>{fmtF(totalGastosReal)}</span></div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,paddingTop:6,marginTop:6,borderTop:`1px dashed ${C.bdr}`}}><span style={{color:C.dim}}>Venta total</span><span style={{color:C.gold,fontWeight:600}}>{fmtF(tot.venta)}</span></div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:700,paddingTop:4}}><span>Neto REAL</span><span style={{color:netoReal>=0?C.green:C.red}}>{fmtF(netoReal)}</span></div>
      </Card>
      {expList.length>0&&<Card>
        <Sec color={C.red}>Gastos por categoría</Sec>
        <ResponsiveContainer width="100%" height={140}>
          <PieChart><Pie data={expList} cx="50%" cy="50%" outerRadius={55} innerRadius={25} dataKey="value" paddingAngle={2}>
            {expList.map((e,i)=><Cell key={i} fill={e.fill}/>)}
          </Pie><Tooltip formatter={v=>fmtF(v)}/></PieChart>
        </ResponsiveContainer>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>{expList.map((e,i)=><span key={i} style={{fontSize:10,color:e.fill}}>● {e.name}</span>)}</div>
      </Card>}
    </div>

    {/* ═══ GASTOS POR TRANSFERENCIA (semanales / proveedores) ═══ */}
    {gastosTransfMonth&&gastosTransfMonth.length>0&&(()=>{
      const semanas=[...new Set(gastosTransfMonth.map(g=>g.periodo))].sort();
      const semanaData=semanas.map(p=>{
        const items=gastosTransfMonth.filter(g=>g.periodo===p);
        return{periodo:p,total:items.reduce((a,g)=>a+g.valor,0),items};
      });
      const catTotals={};
      gastosTransfMonth.forEach(g=>{catTotals[g.categoria]=(catTotals[g.categoria]||0)+g.valor;});
      const catList=Object.entries(catTotals).map(([k,v],i)=>({name:k,value:v,fill:PIE[i%PIE.length]})).sort((a,b)=>b.value-a.value);
      return(<>
        <Card accent={C.purple}>
          <Sec color={C.purple}>💸 Gastos por transferencia (no en cuadre POS)</Sec>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <div style={{background:C.bg,borderRadius:10,padding:"10px 12px",borderLeft:`3px solid ${C.purple}`}}>
              <div style={{fontSize:12,color:C.dim,textTransform:"uppercase",letterSpacing:.8}}>Total transferencias</div>
              <div style={{fontSize:24,fontWeight:700,color:C.purple,fontFamily:"'Poppins',sans-serif",marginTop:4}}>{fmtF(totalTransf)}</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{gastosTransfMonth.length} pagos en {semanas.length} semanas</div>
            </div>
            <div style={{background:C.bg,borderRadius:10,padding:"10px 12px",borderLeft:`3px solid ${netoReal>=0?C.green:C.red}`}}>
              <div style={{fontSize:12,color:C.dim,textTransform:"uppercase",letterSpacing:.8}}>Neto REAL consolidado</div>
              <div style={{fontSize:24,fontWeight:700,color:netoReal>=0?C.green:C.red,fontFamily:"'Poppins',sans-serif",marginTop:4}}>{fmtF(netoReal)}</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>Neto cuadres ({fmtF(tot.neto)}) − transferencias ({fmtF(totalTransf)})</div>
            </div>
          </div>
          {semanaData.map((s,i)=>(
            <div key={i} style={{marginBottom:12,background:C.bg,borderRadius:10,padding:"10px 12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:700,color:C.gold}}>{s.periodo}</span>
                <span style={{fontSize:14,fontWeight:700,color:C.purple}}>{fmtF(s.total)}</span>
              </div>
              {s.items.map((it,j)=>(
                <div key={j} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0",borderBottom:j<s.items.length-1?`1px solid ${C.bdr}`:"none",color:it.valor===0?C.muted:C.text}}>
                  <span>{it.concepto} <span style={{color:C.muted,fontSize:10}}>({it.categoria})</span></span>
                  <span style={{fontWeight:600,color:it.valor===0?C.muted:C.text}}>{fmtF(it.valor)}</span>
                </div>
              ))}
            </div>
          ))}
        </Card>
        {catList.length>1&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Card>
            <Sec color={C.purple}>Transferencias por categoría</Sec>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart><Pie data={catList} cx="50%" cy="50%" outerRadius={55} innerRadius={25} dataKey="value" paddingAngle={2}>
                {catList.map((e,i)=><Cell key={i} fill={e.fill}/>)}
              </Pie><Tooltip formatter={v=>fmtF(v)}/></PieChart>
            </ResponsiveContainer>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginTop:6}}>
              {catList.map((e,i)=><span key={i} style={{fontSize:10,color:e.fill}}>● {e.name} {fmtF(e.value)}</span>)}
            </div>
          </Card>
          <Card>
            <Sec color={C.purple}>Top conceptos</Sec>
            {[...gastosTransfMonth].filter(g=>g.valor>0).sort((a,b)=>b.valor-a.valor).slice(0,5).map((g,i)=>(
              <div key={i} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                  <span>{g.concepto}</span>
                  <span style={{color:C.purple,fontWeight:600}}>{fmtF(g.valor)}</span>
                </div>
                <div style={{background:C.bdr,borderRadius:3,height:5}}><div style={{background:C.purple,height:"100%",width:`${(g.valor/totalTransf)*100}%`,borderRadius:3}}/></div>
              </div>
            ))}
          </Card>
        </div>}
      </>);
    })()}

    {/* ═══ MAPA DE CALOR (semana × día) ═══ */}
    {cuadresMonth.length>=5&&(()=>{
      // Build matrix: rows = semanas (ISO-like, lunes a domingo), cols = días de semana
      const dowOrder=[1,2,3,4,5,6,0]; // Lun, Mar, Mié, Jue, Vie, Sáb, Dom
      const dowLabels=["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
      // Group by ISO week starting on Monday
      const weekKey=d=>{
        const t=new Date(d+"T12:00:00");
        const day=(t.getDay()+6)%7; // 0=Lun, 6=Dom
        const monday=new Date(t); monday.setDate(t.getDate()-day);
        return`${monday.getFullYear()}-${String(monday.getMonth()+1).padStart(2,"0")}-${String(monday.getDate()).padStart(2,"0")}`;
      };
      const weekMap={};
      cuadresMonth.forEach(c=>{
        const wk=weekKey(c.date);
        if(!weekMap[wk]) weekMap[wk]={};
        const dow=new Date(c.date+"T12:00:00").getDay();
        weekMap[wk][dow]=c;
      });
      const sortedWeeks=Object.keys(weekMap).sort();
      const allValues=cuadresMonth.map(c=>c.venta_total).filter(v=>v>0);
      const maxV=Math.max(...allValues,1);
      const heatColor=v=>{
        if(v===0||v==null) return C.bdr;
        const t=Math.min(v/maxV,1);
        // gold-cyan-red scale; we use gold opacity
        const op=0.15+t*0.85;
        return`rgba(201,148,62,${op})`;
      };
      const fmtWeek=wk=>{
        const t=new Date(wk+"T12:00:00");
        const end=new Date(t); end.setDate(t.getDate()+6);
        return`${t.getDate()} ${MO[t.getMonth()]} - ${end.getDate()} ${MO[end.getMonth()]}`;
      };
      return(<Card>
        <Sec color={C.gold}>🔥 Mapa de calor — venta por día de semana</Sec>
        <div style={{fontSize:12,color:C.dim,marginBottom:12}}>Intensidad relativa al día con mayor venta ({fmtF(maxV)}). Tonalidad clara = día flojo · Tonalidad fuerte = día pico.</div>
        <div style={{overflowX:"auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"110px repeat(7, 1fr)",gap:4,minWidth:520}}>
            <div></div>
            {dowLabels.map(d=><div key={d} style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.2,textAlign:"center",fontWeight:700,padding:"4px 0"}}>{d}</div>)}
            {sortedWeeks.flatMap(wk=>[
              <div key={wk+"_l"} style={{fontSize:10,color:C.muted,padding:"6px 4px",fontWeight:600}}>{fmtWeek(wk)}</div>,
              ...dowOrder.map(dow=>{
                const c=weekMap[wk]?.[dow];
                const v=c?.venta_total||0;
                return(<div key={wk+"_"+dow} title={c?`${fmtD(c.date)}: ${fmtF(v)}`:"Sin datos"} style={{background:heatColor(v),aspectRatio:"1.2",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:v>maxV*0.5?C.bg:C.text,cursor:c?"pointer":"default",transition:"transform 0.15s",position:"relative"}}>
                  {v>0?fmt(v).replace("$",""):""}
                </div>);
              })
            ])}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6,marginTop:12,fontSize:10,color:C.muted}}>
          <span>Bajo</span>
          {[0.15,0.3,0.5,0.7,0.95].map(o=><div key={o} style={{width:18,height:14,background:`rgba(201,148,62,${o})`,borderRadius:3}}/>)}
          <span>Alto</span>
        </div>
      </Card>);
    })()}

    {/* ═══ COMPARATIVA SEMANAL ═══ */}
    {cuadresMonth.length>=4&&(()=>{
      // Take last 14 days, split into "esta semana" (last 7) and "semana anterior" (previous 7)
      const sorted=[...cuadresMonth].sort((a,b)=>a.date.localeCompare(b.date));
      const last=sorted.slice(-7);
      const prev=sorted.slice(-14,-7);
      if(prev.length===0) return null;
      const dowKeys=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
      // Build comparison by day-of-week
      const buildMap=(arr)=>{
        const m={};
        arr.forEach(c=>{const dow=new Date(c.date+"T12:00:00").getDay();m[dow]=c;});
        return m;
      };
      const lastMap=buildMap(last);
      const prevMap=buildMap(prev);
      const compData=[1,2,3,4,5,6,0].map(dow=>({
        day:dowKeys[dow],
        actual:lastMap[dow]?.venta_total||0,
        anterior:prevMap[dow]?.venta_total||0,
      }));
      const totalActual=last.reduce((a,c)=>a+c.venta_total,0);
      const totalAnterior=prev.reduce((a,c)=>a+c.venta_total,0);
      const variacion=totalAnterior>0?((totalActual-totalAnterior)/totalAnterior)*100:0;
      return(<Card>
        <Sec color={C.cyan}>📊 Comparativa: última semana vs semana anterior</Sec>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
          <div style={{background:C.bg,borderRadius:12,padding:"10px 14px",borderLeft:`3px solid ${C.cyan}`}}>
            <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.2,fontWeight:600}}>Última semana</div>
            <div style={{fontSize:20,fontWeight:800,color:C.cyan,marginTop:4}}>{fmtF(totalActual)}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{last.length} días con datos</div>
          </div>
          <div style={{background:C.bg,borderRadius:12,padding:"10px 14px",borderLeft:`3px solid ${C.dim}`}}>
            <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.2,fontWeight:600}}>Semana anterior</div>
            <div style={{fontSize:20,fontWeight:800,color:C.text,marginTop:4}}>{fmtF(totalAnterior)}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{prev.length} días con datos</div>
          </div>
          <div style={{background:`linear-gradient(135deg, ${(variacion>=0?C.greenDim:C.redDim)}25 0%, ${C.bg} 100%)`,borderRadius:12,padding:"10px 14px",borderLeft:`3px solid ${variacion>=0?C.green:C.red}`}}>
            <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.2,fontWeight:600}}>Variación</div>
            <div style={{fontSize:20,fontWeight:800,color:variacion>=0?C.green:C.red,marginTop:4}}>{variacion>=0?"▲":"▼"} {Math.abs(variacion).toFixed(1)}%</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{variacion>=0?"+":""}{fmtF(totalActual-totalAnterior)}</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={compData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.bdr}/>
            <XAxis dataKey="day" tick={{fill:C.muted,fontSize:11}} axisLine={{stroke:C.bdr}}/>
            <YAxis tick={{fill:C.muted,fontSize:10}} axisLine={{stroke:C.bdr}} tickFormatter={fmt}/>
            <Tooltip formatter={v=>fmtF(v)} contentStyle={{background:`${C.card}d8`,backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",border:`1px solid ${C.cyan}40`,borderRadius:12,fontSize:12,boxShadow:"0 8px 24px rgba(0,0,0,0.6)"}}/>
            <Bar dataKey="anterior" name="Semana anterior" fill={C.dim} radius={[8,8,0,0]}/>
            <Bar dataKey="actual" name="Última semana" fill={C.cyan} radius={[8,8,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>);
    })()}

    {/* ═══ PATRÓN SEMANAL ═══ */}
    {cuadresMonth.length>=3&&<Card>
      <Sec>Venta promedio por día de la semana</Sec>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={dowData.filter(d=>d.count>0)}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.bdr}/><XAxis dataKey="day" tick={{fill:C.muted,fontSize:12}} axisLine={{stroke:C.bdr}}/><YAxis tick={{fill:C.muted,fontSize:10}} axisLine={{stroke:C.bdr}} tickFormatter={fmt}/>
          <Tooltip formatter={v=>fmtF(v)} contentStyle={{background:`${C.card}d8`,backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",border:`1px solid ${C.gold}40`,borderRadius:12,fontSize:12,boxShadow:"0 8px 24px rgba(0,0,0,0.6)"}}/>
          <Bar dataKey="avg" name="Promedio" fill={C.gold} radius={[8,8,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </Card>}

    {/* ═══ MEJOR / PEOR ═══ */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card accent={C.green}><div style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:.8,fontWeight:600}}>Mejor día</div><div style={{fontSize:20,fontWeight:700,color:C.green,marginTop:4}}>{fmtF(best.venta_total)}</div><div style={{fontSize:13,color:C.muted}}>{fmtD(best.date)}</div><div style={{fontSize:12,color:C.dim,marginTop:2}}>Neto: {fmtF(best.neto_sala)}</div></Card>
      <Card accent={C.red}><div style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:.8,fontWeight:600}}>Día más bajo</div><div style={{fontSize:20,fontWeight:700,color:C.red,marginTop:4}}>{fmtF(worst.venta_total)}</div><div style={{fontSize:13,color:C.muted}}>{fmtD(worst.date)}</div><div style={{fontSize:12,color:C.dim,marginTop:2}}>Neto: {fmtF(worst.neto_sala)}</div></Card>
    </div>

    {/* ═══ HISTORIAL ═══ */}
    <Card>
      <Sec>Historial día a día</Sec>
      {[...cuadresMonth].reverse().map(c=>{
        const bp=c.venta_total?(c.estanco+c.cocteles)/c.venta_total:0;
        return(<div key={c.date} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.bdr}`}}>
          <div><div style={{fontSize:14,fontWeight:600,color:C.gold}}>{fmtD(c.date)}</div><div style={{fontSize:12,color:C.dim,marginTop:2}}>Est {fmtF(c.estanco)} · Coct {fmtF(c.cocteles)} · Pizza {fmtF(c.pizzeria)}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:700,color:C.text}}>{fmtF(c.venta_total)}</div><div style={{fontSize:13,fontWeight:600,color:c.neto_sala>=0?C.green:C.red}}>Neto {fmtF(c.neto_sala)}</div></div>
        </div>);
      })}
    </Card>
  </div>);
}

// ─── Inventario Dashboard ───
function InventarioDashboard({inventarios,cuadres}){
  // Compute consumption by comparing consecutive final inventories
  const consumoTotal=useMemo(()=>{
    const prods={};
    const finals=inventarios.filter(i=>i.tipo==="final").sort((a,b)=>a.date.localeCompare(b.date));
    for(let idx=1;idx<finals.length;idx++){
      const prev=finals[idx-1];const curr=finals[idx];
      curr.items.forEach(f=>{
        const pItem=prev.items.find(x=>x.nombre===f.nombre);
        const sI=pItem?.saldo||0;const sF=f.saldo||0;
        const consumo=sI-sF;
        if(!prods[f.nombre])prods[f.nombre]={nombre:f.nombre,consumo:0,saldoFinal:sF,days:0};
        if(consumo>0){prods[f.nombre].consumo+=consumo;prods[f.nombre].days++;}
        prods[f.nombre].saldoFinal=sF;
      });
    }
    return Object.values(prods).sort((a,b)=>b.consumo-a.consumo);
  },[inventarios]);

  const lastFinal=useMemo(()=>{
    const finals=inventarios.filter(i=>i.tipo==="final").sort((a,b)=>b.date.localeCompare(a.date));
    return finals[0]||null;
  },[inventarios]);

  const stockBajo=useMemo(()=>{
    if(!lastFinal)return[];
    return (lastFinal.items||[]).filter(i=>i.saldo<=2).sort((a,b)=>(a.saldo||0)-(b.saldo||0));
  },[lastFinal]);

  // Daily consumption trend (compare each day vs previous)
  const dailyTrend=useMemo(()=>{
    const finals=inventarios.filter(i=>i.tipo==="final").sort((a,b)=>a.date.localeCompare(b.date));
    const trend=[];
    for(let idx=1;idx<finals.length;idx++){
      const prev=finals[idx-1];const curr=finals[idx];
      let tc=0;
      curr.items.forEach(f=>{
        const pItem=prev.items.find(x=>x.nombre===f.nombre);
        const c=(pItem?.saldo||0)-(f.saldo||0);
        if(c>0)tc+=c;
      });
      trend.push({d:fmtD(curr.date).split(" ").slice(0,2).join(" "),totalConsumo:tc});
    }
    return trend;
  },[inventarios]);

  const daysWithData=inventarios.filter(i=>i.tipo==="final").length;

  if(daysWithData<=1) return <div style={{textAlign:"center",padding:60,color:C.dim}}><div style={{fontSize:52,marginBottom:14}}>📦</div><p style={{fontSize:20,fontWeight:600}}>Necesita al menos 2 días de inventario para calcular consumos</p></div>;

  return(<div>
    <div style={{fontSize:22,fontWeight:700,color:C.cyan,marginBottom:4}}>📦 Control de Inventario</div>
    <div style={{fontSize:13,color:C.dim,marginBottom:16}}>{daysWithData} días con inventario · Consumo calculado entre días consecutivos</div>

    {/* ═══ ALERTAS STOCK BAJO ═══ */}
    {stockBajo.length>0&&<Card accent={C.red} style={{background:`linear-gradient(135deg, ${C.red}10 0%, ${C.card} 100%)`}}>
      <Sec color={C.red}>⚠️ Alerta stock bajo — inventario actual</Sec>
      <div style={{fontSize:12,color:C.dim,marginBottom:12}}>Productos con 2 unidades o menos al cierre de {lastFinal?fmtD(lastFinal.date):""}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {stockBajo.map((p,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",background:p.saldo===0?`${C.red}18`:C.bg,border:p.saldo===0?`1px solid ${C.red}50`:`1px solid ${C.bdr}`,borderRadius:10,fontSize:13,alignItems:"center",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
              {p.saldo===0&&<span className="pulse-dot" style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:C.red,boxShadow:`0 0 8px ${C.red}`,flexShrink:0}}/>}
              <span style={{color:p.saldo===0?C.red:C.text,fontWeight:p.saldo===0?700:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.nombre}</span>
            </div>
            <span style={{fontWeight:800,color:p.saldo===0?C.red:C.orange,fontSize:14,letterSpacing:0.5,flexShrink:0}}>{p.saldo===0?"AGOTADO":p.saldo}</span>
          </div>
        ))}
      </div>
    </Card>}

    {/* ═══ CONSUMO DIARIO ═══ */}
    {dailyTrend.length>0&&<Card>
      <Sec color={C.cyan}>Consumo diario (unidades totales)</Sec>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={dailyTrend}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.bdr}/>
          <XAxis dataKey="d" tick={{fill:C.muted,fontSize:11}} axisLine={{stroke:C.bdr}}/>
          <YAxis tick={{fill:C.muted,fontSize:10}} axisLine={{stroke:C.bdr}}/>
          <Tooltip contentStyle={{background:`${C.card}d8`,backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",border:`1px solid ${C.gold}40`,borderRadius:12,fontSize:12,boxShadow:"0 8px 24px rgba(0,0,0,0.6)"}}/>
          <Bar dataKey="totalConsumo" name="Consumo" fill={C.orange} radius={[8,8,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </Card>}

    {/* ═══ TOP CONSUMO ACUMULADO ═══ */}
    <Card>
      <Sec color={C.cyan}>Top consumo acumulado — todos los productos</Sec>
      <ResponsiveContainer width="100%" height={Math.min(consumoTotal.filter(p=>p.consumo>0).length*28+40,400)}>
        <BarChart data={consumoTotal.filter(p=>p.consumo>0).slice(0,15)} layout="vertical" margin={{left:130}}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.bdr}/>
          <XAxis type="number" tick={{fill:C.muted,fontSize:10}} axisLine={{stroke:C.bdr}}/>
          <YAxis type="category" dataKey="nombre" tick={{fill:C.text,fontSize:10}} axisLine={{stroke:C.bdr}} width={125}/>
          <Tooltip contentStyle={{background:`${C.card}d8`,backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",border:`1px solid ${C.cyan}40`,borderRadius:12,fontSize:12,boxShadow:"0 8px 24px rgba(0,0,0,0.6)"}}/>
          <Bar dataKey="consumo" name="Consumo total" fill={C.cyan} radius={[0,10,10,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </Card>

    {/* ═══ SNAPSHOT INVENTARIO ACTUAL ═══ */}
    {lastFinal&&<Card>
      <Sec>📋 Inventario actual — cierre {fmtD(lastFinal.date)}</Sec>
      <div style={{fontSize:9,display:"grid",gridTemplateColumns:"1fr 50px",gap:4,padding:"6px 0",borderBottom:`2px solid ${C.bdr}`,color:C.dim,fontWeight:700,textTransform:"uppercase"}}>
        <span>Producto</span><span style={{textAlign:"center"}}>Stock</span>
      </div>
      {[...lastFinal.items].sort((a,b)=>(b.saldo||0)-(a.saldo||0)).filter(i=>i.saldo>0||i.saldo===0).map((item,i)=>(
        <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 50px",gap:4,padding:"5px 0",borderBottom:`1px solid ${C.bdr}15`,fontSize:12,alignItems:"center"}}>
          <span style={{color:item.saldo===0?C.red:item.saldo<=2?C.orange:C.text}}>{item.nombre}</span>
          <span style={{textAlign:"center",fontWeight:700,color:item.saldo===0?C.red:item.saldo<=2?C.orange:item.saldo>=20?C.green:C.text,background:item.saldo<=2?C.red+"15":"transparent",borderRadius:4,padding:"2px 0"}}>{item.saldo}</span>
        </div>
      ))}
    </Card>}
  </div>);
}

function Resumen({c,coc,gas,cross,date}){
  if(!c) return <div style={{textAlign:"center",padding:60,color:C.dim}}><div style={{fontSize:52,marginBottom:12}}>📸</div><p style={{fontFamily:"'Poppins',sans-serif",fontSize:20}}>Sin cuadre para {fmtD(date)}</p><p style={{fontSize:14}}>Envía las fotos de tus recibos del POS a Claude y los registro automáticamente</p></div>;

  const barPct=(c.estanco+c.cocteles)/c.venta_total;
  const venSplit=[{n:"Estanco",v:c.estanco,c:C.gold},{n:"Cocteles",v:c.cocteles,c:C.cyan},{n:"Pizzería",v:c.pizzeria,c:C.orange}].filter(x=>x.v>0);
  const totalG=c.pizza_80+c.gastos+c.nomina+(c.costo_financiero||0);

  return(<div>
    <h2 style={{fontFamily:"'Poppins',sans-serif",fontSize:22,color:C.gold,margin:"0 0 4px"}}>{fmtD(date)}</h2>
    <p style={{fontSize:14,color:C.dim,marginBottom:14}}>Datos extraídos de fotos del POS</p>

    <Card accent={c.neto_sala>=0?C.green:C.red} style={{background:(c.neto_sala>=0?C.greenDim:C.redDim)+"12"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:14,color:C.dim,textTransform:"uppercase",letterSpacing:.8}}>Venta Total</div><div style={{fontSize:32,fontWeight:700,fontFamily:"'Poppins',sans-serif",color:C.gold,marginTop:4}}>{fmtF(c.venta_total)}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:14,color:C.dim,textTransform:"uppercase",letterSpacing:.8}}>Neto La Sala</div><div style={{fontSize:32,fontWeight:700,fontFamily:"'Poppins',sans-serif",color:c.neto_sala>=0?C.green:C.red,marginTop:4}}>{fmtF(c.neto_sala)}</div></div>
      </div>
    </Card>

    <Card>
      <Sec color={C.gold}>Ventas por Categoría</Sec>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {venSplit.map((v,i)=><div key={i} style={{background:C.bg,borderRadius:10,padding:"10px 12px",borderLeft:`3px solid ${v.c}`}}>
          <div style={{fontSize:14,color:C.dim}}>{v.n}</div>
          <div style={{fontSize:22,fontWeight:700,color:v.c,fontFamily:"'Poppins',sans-serif"}}>{fmtF(v.v)}</div>
          <div style={{fontSize:13,color:C.muted}}>{pct(v.v,c.venta_total)}</div>
        </div>)}
      </div>
      <div style={{marginTop:10}}>
        <div style={{fontSize:14,color:C.dim,marginBottom:4}}>Bar ({(barPct*100).toFixed(0)}%) vs Cocina ({((1-barPct)*100).toFixed(0)}%)</div>
        <div style={{display:"flex",height:22,borderRadius:6,overflow:"hidden"}}>
          <div style={{width:`${barPct*100}%`,background:`linear-gradient(90deg,${C.gold},${C.cyan})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:C.bg}}>Bar</div>
          <div style={{flex:1,background:C.orange,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:C.bg}}>Cocina</div>
        </div>
        <div style={{marginTop:6,padding:"5px 8px",background:barPct>=.6?C.greenDim+"18":C.redDim+"18",borderRadius:6,fontSize:14,color:barPct>=.6?C.green:C.red}}>
          {barPct>=.6?"✓ Bar genera "+((barPct*100).toFixed(0))+"% — alineado con la estrategia":"⚠ Cocina pesa más de lo esperado"}
        </div>
      </div>
    </Card>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <Card><Sec color={C.blue}>Pagos</Sec>
        {[{n:"Tarjeta",v:c.tarjeta,c:C.blue},{n:"Efectivo",v:c.efectivo,c:C.green},{n:"Otros (Nequi)",v:c.otros_pago,c:C.purple}].map((p,i)=>
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.bdr}`,fontSize:13}}><span style={{color:C.dim}}>{p.n}</span><span style={{color:p.c,fontWeight:600}}>{fmtF(p.v)}</span></div>
        )}
        {c.faltante===0&&<div style={{marginTop:6,fontSize:14,color:C.green}}>✓ Sin faltante</div>}
      </Card>
      <Card><Sec color={C.red}>Gastos</Sec>
        {[{n:"Pizza 80%",v:c.pizza_80,c:C.orange},{n:"Gastos Op.",v:c.gastos,c:C.red},{n:"Nómina",v:c.nomina,c:C.purple},{n:"Costo fin. (5%)",v:c.costo_financiero||0,c:C.blue}].map((e,i)=>
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.bdr}`,fontSize:13}}><span style={{color:C.dim}}>{e.n}</span><span style={{color:e.c,fontWeight:600}}>{fmtF(e.v)}</span></div>
        )}
        <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0 0",fontSize:14,fontWeight:700}}><span>Total</span><span style={{color:C.red}}>{fmtF(totalG)}</span></div>
      </Card>
    </div>

    {coc&&coc.productos?.length>0&&<Card>
      <Sec color={C.orange}>🍕 Cocina — {coc.total_units} productos</Sec>
      {coc.productos.slice(0,10).map((p,i)=>{const mx=coc.productos[0]?.valor||1;return(
        <div key={i} style={{marginBottom:5}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:2}}>
            <span><span style={{color:C.gold,fontWeight:700,marginRight:4}}>{i+1}.</span>{p.nombre}</span>
            <span style={{color:C.orange,fontWeight:600}}>{p.cantidad}× = {fmtF(p.valor)}</span>
          </div>
          <div style={{background:C.bdr,borderRadius:3,height:4}}><div style={{background:C.orange,height:"100%",width:`${(p.valor/mx)*100}%`,borderRadius:3}}/></div>
        </div>
      );})}
    </Card>}

    {cross&&cross.length>0&&<Card>
      <Sec color={C.cyan}>📦 Movimiento Inventario</Sec>
      <div style={{fontSize:13,display:"grid",gridTemplateColumns:"1fr 35px 35px 35px 45px",gap:4,padding:"4px 0",borderBottom:`1px solid ${C.bdr}`,color:C.dim,fontWeight:600,textTransform:"uppercase"}}>
        <span>Producto</span><span style={{textAlign:"center"}}>Ini</span><span style={{textAlign:"center"}}>+Ent</span><span style={{textAlign:"center"}}>Fin</span><span style={{textAlign:"center"}}>Cons.</span>
      </div>
      {cross.filter(d=>d.consumo>0).slice(0,12).map((d,i)=>(
        <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 35px 35px 35px 45px",gap:4,padding:"4px 0",borderBottom:`1px solid ${C.bdr}15`,fontSize:14,alignItems:"center"}}>
          <span style={{color:d.consumo>=3?C.text:C.dim}}>{d.nombre}</span>
          <span style={{textAlign:"center",color:C.muted}}>{d.ini}</span>
          <span style={{textAlign:"center",color:d.ent?C.green:C.muted}}>{d.ent||"—"}</span>
          <span style={{textAlign:"center",color:C.muted}}>{d.fin}</span>
          <span style={{textAlign:"center",fontWeight:700,color:d.consumo>=5?C.red:d.consumo>=3?C.orange:C.cyan,background:d.consumo>=3?C.orange+"15":"transparent",borderRadius:4}}>{d.consumo}</span>
        </div>
      ))}
    </Card>}

    {gas&&gas.items?.length>0&&<Card>
      <Sec color={C.red}>📋 Gastos Detallados — {fmtF(gas.total)}</Sec>
      {gas.items.map((it,i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${C.bdr}15`,fontSize:13}}>
          <div><div>{it.concepto}</div><div style={{fontSize:13,color:C.muted,marginTop:1}}>{it.categoria}</div></div>
          <span style={{color:C.red,fontWeight:600,whiteSpace:"nowrap"}}>{fmtF(it.valor)}</span>
        </div>
      ))}
    </Card>}
  </div>);
}

function Cocina({coc,date}){
  if(!coc) return <div style={{textAlign:"center",padding:60,color:C.dim}}><p>Sin datos cocina — {fmtD(date)}</p></div>;
  const byCat=useMemo(()=>{const cats={Pizzas:[],Hamburguesas:[],Alitas:[],Otros:[]};(coc.productos||[]).forEach(p=>{if(p.nombre.startsWith("PZ"))cats.Pizzas.push(p);else if(p.nombre.includes("HB"))cats.Hamburguesas.push(p);else if(p.nombre.includes("ALITAS"))cats.Alitas.push(p);else cats.Otros.push(p);});return Object.entries(cats).filter(([,v])=>v.length>0);},[coc]);
  const pieData=(coc.productos||[]).map((p,i)=>({name:p.nombre,value:p.valor,fill:PIE[i%PIE.length]}));

  return(<div>
    <h2 style={{fontFamily:"'Poppins',sans-serif",fontSize:22,color:C.orange,margin:"0 0 14px"}}>🍕 Cocina — {fmtD(date)}</h2>
    <Card accent={C.orange} style={{background:C.orange+"08"}}>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <div><div style={{fontSize:14,color:C.dim}}>Total</div><div style={{fontSize:32,fontWeight:700,color:C.orange,fontFamily:"'Poppins',sans-serif"}}>{fmtF(coc.total)}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:14,color:C.dim}}>Productos</div><div style={{fontSize:32,fontWeight:700,color:C.text,fontFamily:"'Poppins',sans-serif"}}>{coc.total_units}</div></div>
      </div>
    </Card>
    <Card>
      <Sec>Distribución</Sec>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart><Pie data={pieData.slice(0,8)} cx="50%" cy="50%" outerRadius={70} innerRadius={30} dataKey="value" paddingAngle={2}>
          {pieData.slice(0,8).map((e,i)=><Cell key={i} fill={e.fill}/>)}
        </Pie><Tooltip formatter={v=>fmtF(v)}/></PieChart>
      </ResponsiveContainer>
    </Card>
    {byCat.map(([cat,prods])=><Card key={cat}>
      <Sec color={C.orange}>{cat} ({prods.reduce((s,p)=>s+p.cantidad,0)} uds — {fmtF(prods.reduce((s,p)=>s+p.valor,0))})</Sec>
      {prods.sort((a,b)=>b.valor-a.valor).map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.bdr}15`,fontSize:14}}>
        <span>{p.nombre}</span><span><span style={{color:C.dim,marginRight:8}}>{p.cantidad}×</span><span style={{color:C.orange,fontWeight:600}}>{fmtF(p.valor)}</span></span>
      </div>)}
    </Card>)}
  </div>);
}

function Inventario({cross,prevFin,fin,date}){
  return(<div>
    <h2 style={{fontFamily:"'Poppins',sans-serif",fontSize:22,color:C.cyan,margin:"0 0 14px"}}>📦 Inventario — {fmtD(date)}</h2>
    {cross&&cross.length>0?<>
      <Card accent={C.cyan}>
        <Sec color={C.cyan}>Cruce Inventario: Consumo Real</Sec>
        <p style={{fontSize:14,color:C.dim,marginBottom:10}}>Saldo día anterior → Saldo hoy = Consumo{prevFin?` (vs ${fmtD(prevFin.date)})`:""}</p>
        <div style={{fontSize:13,display:"grid",gridTemplateColumns:"1fr 50px 50px 50px",gap:4,padding:"6px 0",borderBottom:`2px solid ${C.bdr}`,color:C.dim,fontWeight:700,textTransform:"uppercase"}}>
          <span>Producto</span><span style={{textAlign:"center"}}>Antes</span><span style={{textAlign:"center"}}>Hoy</span><span style={{textAlign:"center"}}>Consumo</span>
        </div>
        {cross.map((d,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 50px 50px 50px",gap:4,padding:"5px 0",borderBottom:`1px solid ${C.bdr}20`,fontSize:13,alignItems:"center"}}>
          <span style={{fontWeight:d.consumo>=3?600:400,color:d.consumo>=3?C.text:C.dim}}>{d.nombre}</span>
          <span style={{textAlign:"center",color:C.muted}}>{d.ini}</span>
          <span style={{textAlign:"center",color:C.muted}}>{d.fin}</span>
          <span style={{textAlign:"center",fontWeight:700,color:d.consumo>=5?C.red:d.consumo>=3?C.orange:C.cyan,background:d.consumo>=5?C.red+"15":d.consumo>=3?C.orange+"15":"transparent",borderRadius:4,padding:"2px 0"}}>{d.consumo}</span>
        </div>)}
      </Card>
      <Card><Sec color={C.orange}>Alta Rotación</Sec>
        <ResponsiveContainer width="100%" height={Math.min(cross.filter(d=>d.consumo>=2).length*28+40,300)}>
          <BarChart data={cross.filter(d=>d.consumo>=2).slice(0,10)} layout="vertical" margin={{left:120}}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.bdr}/>
            <XAxis type="number" tick={{fill:C.muted,fontSize:14}} axisLine={{stroke:C.bdr}}/>
            <YAxis type="category" dataKey="nombre" tick={{fill:C.text,fontSize:13}} axisLine={{stroke:C.bdr}} width={115}/>
            <Bar dataKey="consumo" name="Consumo" fill={C.cyan} radius={[0,4,4,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      {cross.filter(d=>d.fin<=2).length>0&&<Card accent={C.red}>
        <Sec color={C.red}>⚠️ Stock Bajo (≤2 unidades)</Sec>
        {cross.filter(d=>d.fin<=2).map((d,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.bdr}15`,fontSize:14}}>
          <span>{d.nombre}</span><span style={{color:d.fin===0?C.red:C.orange,fontWeight:700}}>{d.fin===0?"AGOTADO":`${d.fin} uds`}</span>
        </div>)}
      </Card>}
    </>:<Card><p style={{color:C.dim,textAlign:"center",padding:20}}>{!fin?"Sin inventario para este día":"Es el primer día — no hay día anterior para comparar"}</p></Card>}
  </div>);
}

function Gastos({gas,date}){
  if(!gas) return <div style={{textAlign:"center",padding:60,color:C.dim}}><p>Sin gastos para {fmtD(date)}</p></div>;
  const byCat=useMemo(()=>{const cats={};(gas.items||[]).forEach(it=>{const c=it.categoria||"Varios";if(!cats[c])cats[c]={total:0,items:[]};cats[c].total+=it.valor;cats[c].items.push(it);});return Object.entries(cats).sort((a,b)=>b[1].total-a[1].total);},[gas]);
  const pieData=byCat.map(([n,d],i)=>({name:n,value:d.total,fill:PIE[i%PIE.length]}));

  return(<div>
    <h2 style={{fontFamily:"'Poppins',sans-serif",fontSize:22,color:C.red,margin:"0 0 14px"}}>📋 Gastos — {fmtD(date)}</h2>
    <Card accent={C.red} style={{background:C.redDim+"10"}}>
      <div style={{fontSize:14,color:C.dim}}>Total Gastos</div>
      <div style={{fontSize:32,fontWeight:700,color:C.red,fontFamily:"'Poppins',sans-serif",marginTop:4}}>{fmtF(gas.total)}</div>
      <div style={{fontSize:14,color:C.muted,marginTop:2}}>{gas.items?.length} conceptos</div>
    </Card>
    <Card><Sec>Por Categoría</Sec>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={65} innerRadius={28} dataKey="value" paddingAngle={3}>
          {pieData.map((e,i)=><Cell key={i} fill={e.fill}/>)}
        </Pie><Tooltip formatter={v=>fmtF(v)}/></PieChart>
      </ResponsiveContainer>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginTop:4}}>
        {pieData.map((e,i)=><span key={i} style={{fontSize:14,color:e.fill}}>● {e.name}: {fmtF(e.value)}</span>)}
      </div>
    </Card>
    {byCat.map(([cat,data],ci)=><Card key={cat} accent={PIE[ci%PIE.length]}>
      <Sec color={PIE[ci%PIE.length]}>{cat} — {fmtF(data.total)}</Sec>
      {data.items.map((it,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.bdr}15`,fontSize:14}}>
        <span>{it.concepto}</span><span style={{color:C.red,fontWeight:600}}>{fmtF(it.valor)}</span>
      </div>)}
    </Card>)}
  </div>);
}

// ═════════════════════════════════════════════════════════════════
// ─── INVENTARIO VALORIZADO ───
// ═════════════════════════════════════════════════════════════════
function InventarioValorizado({inventarios}){
  // Tomar el último inventario "final" disponible
  const finals=(inventarios||[]).filter(x=>x.tipo==="final").sort((a,b)=>a.date.localeCompare(b.date));
  const last=finals[finals.length-1];

  if(!last) return <Card><div style={{textAlign:"center",padding:30,color:C.dim}}>Sin inventarios cargados aún</div></Card>;

  // Construir filas valorizadas con catálogo
  const rows=last.items.map(it=>{
    const cat=CATALOG[it.nombre]||{categoria:"Sin clasificar",compra:0,venta:0,fuente:"",notas:""};
    const valorCosto=(it.saldo||0)*(cat.compra||0);
    const valorVenta=(it.saldo||0)*(cat.venta||0);
    const margenUnit=(cat.venta||0)-(cat.compra||0);
    const margenPct=cat.venta?((cat.venta-cat.compra)/cat.venta):0;
    const utilidadPotencial=valorVenta-valorCosto;
    return {nombre:it.nombre,saldo:it.saldo,...cat,valorCosto,valorVenta,margenUnit,margenPct,utilidadPotencial};
  });

  // KPIs globales
  const totales=rows.reduce((a,r)=>{
    a.unidades+=Math.max(0,r.saldo);
    a.distintos+=r.saldo>0?1:0;
    a.cero+=r.saldo===0?1:0;
    a.negativos+=r.saldo<0?1:0;
    a.valorCosto+=r.valorCosto;
    a.valorVenta+=r.valorVenta;
    a.utilidad+=r.utilidadPotencial;
    return a;
  },{unidades:0,distintos:0,cero:0,negativos:0,valorCosto:0,valorVenta:0,utilidad:0});
  totales.margenPromedio=totales.valorVenta?totales.utilidad/totales.valorVenta:0;

  // Sort estado: por defecto por valor inventario al costo descendente
  const [sortBy,setSortBy]=useState("valorCosto");
  const [filterCat,setFilterCat]=useState("todos");
  const cats=["todos",...new Set(rows.map(r=>r.categoria))];
  const filtered=filterCat==="todos"?rows:rows.filter(r=>r.categoria===filterCat);
  const sorted=[...filtered].sort((a,b)=>{
    if(sortBy==="valorCosto")return b.valorCosto-a.valorCosto;
    if(sortBy==="margen")return b.margenPct-a.margenPct;
    if(sortBy==="saldo")return b.saldo-a.saldo;
    if(sortBy==="utilidad")return b.utilidadPotencial-a.utilidadPotencial;
    return a.nombre.localeCompare(b.nombre);
  });

  return(<div>
    <Card accent={C.gold}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:11,color:C.gold,textTransform:"uppercase",letterSpacing:2.5,fontWeight:700}}>● Inventario valorizado</div>
          <div style={{fontSize:13,color:C.dim,marginTop:4}}>Cierre {fmtD(last.date)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600}}>Inventario al costo</div>
          <div style={{fontSize:30,fontWeight:800,color:C.gold,fontFamily:"'Poppins',sans-serif",letterSpacing:-0.5,lineHeight:1.1,marginTop:4}}>{fmtF(totales.valorCosto)}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>valor potencial venta {fmtF(totales.valorVenta)}</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:10}}>
        <div style={{background:C.bg,padding:"10px 12px",borderRadius:10,border:`1px solid ${C.bdr}`}}>
          <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>Unidades</div>
          <div style={{fontSize:20,fontWeight:800,color:C.text,marginTop:4}}>{totales.unidades}</div>
          <div style={{fontSize:10,color:C.muted}}>{totales.distintos} productos &gt; 0</div>
        </div>
        <div style={{background:C.bg,padding:"10px 12px",borderRadius:10,border:`1px solid ${C.bdr}`}}>
          <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>Util. potencial</div>
          <div style={{fontSize:20,fontWeight:800,color:C.green,marginTop:4}}>{fmtF(totales.utilidad)}</div>
          <div style={{fontSize:10,color:C.muted}}>margen {(totales.margenPromedio*100).toFixed(1)}%</div>
        </div>
        <div style={{background:C.bg,padding:"10px 12px",borderRadius:10,border:`1px solid ${C.bdr}`}}>
          <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>En cero</div>
          <div style={{fontSize:20,fontWeight:800,color:C.orange,marginTop:4}}>{totales.cero}</div>
          <div style={{fontSize:10,color:C.muted}}>productos sin stock</div>
        </div>
        <div style={{background:C.bg,padding:"10px 12px",borderRadius:10,border:`1px solid ${C.bdr}${totales.negativos>0?";borderColor:"+C.red:""}`}}>
          <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>Negativos</div>
          <div style={{fontSize:20,fontWeight:800,color:totales.negativos>0?C.red:C.muted,marginTop:4}}>{totales.negativos}</div>
          <div style={{fontSize:10,color:C.muted}}>{totales.negativos>0?"⚠ revisar":"sin alertas"}</div>
        </div>
      </div>
    </Card>

    <Card>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
        <span style={{fontSize:11,color:C.dim,letterSpacing:2,textTransform:"uppercase",fontWeight:600,marginRight:6}}>Categoría</span>
        {cats.map(c=>(
          <button key={c} onClick={()=>setFilterCat(c)} style={{
            background:c===filterCat?C.gold:"transparent",color:c===filterCat?C.bg:C.gold,
            border:`1px solid ${c===filterCat?C.gold:C.gold+"60"}`,padding:"4px 10px",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"
          }}>{c}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
        <span style={{fontSize:11,color:C.dim,letterSpacing:2,textTransform:"uppercase",fontWeight:600,marginRight:6}}>Ordenar</span>
        {[{k:"valorCosto",l:"Valor inv."},{k:"saldo",l:"Saldo"},{k:"margen",l:"Margen %"},{k:"utilidad",l:"Utilidad"},{k:"nombre",l:"A-Z"}].map(o=>(
          <button key={o.k} onClick={()=>setSortBy(o.k)} style={{
            background:o.k===sortBy?C.green:"transparent",color:o.k===sortBy?C.bg:C.green,
            border:`1px solid ${o.k===sortBy?C.green:C.green+"60"}`,padding:"4px 10px",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"
          }}>{o.l}</button>
        ))}
      </div>
      <div style={{overflow:"auto",maxHeight:600}}>
      <table style={{width:"100%",fontSize:12,borderCollapse:"collapse"}}>
        <thead style={{position:"sticky",top:0,background:C.card,zIndex:1}}>
          <tr style={{borderBottom:`2px solid ${C.gold}40`,color:C.gold,textAlign:"left"}}>
            <th style={{padding:"8px 6px"}}>Producto</th>
            <th style={{padding:"8px 6px",textAlign:"right"}}>Saldo</th>
            <th style={{padding:"8px 6px",textAlign:"right"}}>Compra</th>
            <th style={{padding:"8px 6px",textAlign:"right"}}>Venta</th>
            <th style={{padding:"8px 6px",textAlign:"right"}}>Margen %</th>
            <th style={{padding:"8px 6px",textAlign:"right"}}>Inv. costo</th>
            <th style={{padding:"8px 6px",textAlign:"right"}}>Util. pot.</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r,i)=>{
            const colorRow=r.saldo<0?C.red+"15":r.saldo===0?C.dim+"08":"transparent";
            const catColor=(CATEGORIAS.find(c=>c.nombre===r.categoria)||{}).color||C.muted;
            return(<tr key={i} style={{background:colorRow,borderBottom:`1px solid ${C.bdr}30`}}>
              <td style={{padding:"6px"}}>
                <div style={{fontWeight:600,color:C.text}}>{r.nombre}</div>
                <div style={{fontSize:10,color:catColor}}>● {r.categoria}</div>
              </td>
              <td style={{padding:"6px",textAlign:"right",fontWeight:700,color:r.saldo<0?C.red:r.saldo===0?C.dim:C.text}}>{r.saldo}</td>
              <td style={{padding:"6px",textAlign:"right",color:C.muted}}>{r.compra?fmtF(r.compra):"—"}</td>
              <td style={{padding:"6px",textAlign:"right",color:C.muted}}>{r.venta?fmtF(r.venta):"insumo"}</td>
              <td style={{padding:"6px",textAlign:"right",color:r.margenPct>=0.5?C.green:r.margenPct>0?C.gold:C.muted,fontWeight:600}}>{r.venta?(r.margenPct*100).toFixed(0)+"%":"—"}</td>
              <td style={{padding:"6px",textAlign:"right",fontWeight:700,color:C.gold}}>{fmtF(r.valorCosto)}</td>
              <td style={{padding:"6px",textAlign:"right",fontWeight:700,color:r.utilidadPotencial>0?C.green:C.muted}}>{r.utilidadPotencial?fmtF(r.utilidadPotencial):"—"}</td>
            </tr>);
          })}
        </tbody>
        <tfoot style={{position:"sticky",bottom:0,background:C.card,zIndex:1}}>
          {(()=>{
            const tot=sorted.reduce((a,r)=>{
              a.unidades+=Math.max(0,r.saldo);
              a.negativos+=r.saldo<0?1:0;
              a.cero+=r.saldo===0?1:0;
              a.valorCosto+=r.valorCosto;
              a.valorVenta+=r.valorVenta;
              a.utilidad+=r.utilidadPotencial;
              return a;
            },{unidades:0,negativos:0,cero:0,valorCosto:0,valorVenta:0,utilidad:0});
            const margenProm=tot.valorVenta?(tot.utilidad/tot.valorVenta):0;
            return(<tr style={{borderTop:`2px solid ${C.gold}`,background:C.gold+"15",fontWeight:800}}>
              <td style={{padding:"10px 6px",color:C.gold,fontFamily:"'Poppins',sans-serif",letterSpacing:1}}>
                <div style={{fontSize:13,fontWeight:800}}>TOTAL {filterCat==="todos"?"":`· ${filterCat}`}</div>
                <div style={{fontSize:10,color:C.muted,fontWeight:500}}>{sorted.length} productos · {tot.cero} en cero · {tot.negativos} neg.</div>
              </td>
              <td style={{padding:"10px 6px",textAlign:"right",color:C.text,fontSize:14}}>{tot.unidades}</td>
              <td style={{padding:"10px 6px",textAlign:"right",color:C.muted,fontSize:11,fontStyle:"italic"}}>—</td>
              <td style={{padding:"10px 6px",textAlign:"right",color:C.muted,fontSize:11,fontStyle:"italic"}}>—</td>
              <td style={{padding:"10px 6px",textAlign:"right",color:margenProm>=0.5?C.green:margenProm>0?C.gold:C.muted,fontSize:13}}>{tot.valorVenta?(margenProm*100).toFixed(1)+"%":"—"}</td>
              <td style={{padding:"10px 6px",textAlign:"right",color:C.gold,fontSize:14}}>{fmtF(tot.valorCosto)}</td>
              <td style={{padding:"10px 6px",textAlign:"right",color:tot.utilidad>0?C.green:C.muted,fontSize:14}}>{fmtF(tot.utilidad)}</td>
            </tr>);
          })()}
        </tfoot>
      </table>
      </div>
    </Card>
  </div>);
}

// ═════════════════════════════════════════════════════════════════
// ─── ANÁLISIS POR CATEGORÍA ───
// ═════════════════════════════════════════════════════════════════
function AnalisisCategoria({inventarios,cocina}){
  const finals=(inventarios||[]).filter(x=>x.tipo==="final").sort((a,b)=>a.date.localeCompare(b.date));
  const last=finals[finals.length-1];

  if(!last) return <Card><div style={{textAlign:"center",padding:30,color:C.dim}}>Sin inventarios cargados</div></Card>;

  // Agrupar por categoría
  const porCat={};
  last.items.forEach(it=>{
    const cat=CATALOG[it.nombre]||{categoria:"Sin clasificar",compra:0,venta:0};
    const c=cat.categoria;
    if(!porCat[c])porCat[c]={productos:0,unidades:0,valorCosto:0,valorVenta:0,utilidad:0,negativos:0,enCero:0,items:[]};
    porCat[c].productos++;
    porCat[c].unidades+=Math.max(0,it.saldo);
    porCat[c].valorCosto+=Math.max(0,it.saldo)*cat.compra;
    porCat[c].valorVenta+=Math.max(0,it.saldo)*cat.venta;
    porCat[c].utilidad+=Math.max(0,it.saldo)*(cat.venta-cat.compra);
    if(it.saldo<0)porCat[c].negativos++;
    if(it.saldo===0)porCat[c].enCero++;
    porCat[c].items.push({...it,...cat,valorCosto:Math.max(0,it.saldo)*cat.compra});
  });

  const filas=CATEGORIAS.map(cat=>({nombre:cat.nombre,color:cat.color,...(porCat[cat.nombre]||{productos:0,unidades:0,valorCosto:0,valorVenta:0,utilidad:0,negativos:0,enCero:0,items:[]})}))
    .filter(c=>c.productos>0);

  const totalCosto=filas.reduce((a,c)=>a+c.valorCosto,0);
  const totalVenta=filas.reduce((a,c)=>a+c.valorVenta,0);
  const totalUtil=filas.reduce((a,c)=>a+c.utilidad,0);

  const pieData=filas.filter(c=>c.valorCosto>0).map(c=>({name:c.nombre,value:c.valorCosto,fill:c.color}));

  return(<div>
    <Card accent={C.gold}>
      <Sec color={C.gold}>● Análisis por categoría · {fmtD(last.date)}</Sec>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        <div>
          <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>Total al costo</div>
          <div style={{fontSize:24,fontWeight:800,color:C.gold,marginTop:4}}>{fmtF(totalCosto)}</div>
        </div>
        <div>
          <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>Utilidad potencial</div>
          <div style={{fontSize:24,fontWeight:800,color:C.green,marginTop:4}}>{fmtF(totalUtil)}</div>
          <div style={{fontSize:10,color:C.muted}}>margen {totalVenta?(totalUtil/totalVenta*100).toFixed(1):"0"}%</div>
        </div>
      </div>
      {pieData.length>0&&<ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} innerRadius={35} dataKey="value" paddingAngle={2}>
            {pieData.map((e,i)=><Cell key={i} fill={e.fill}/>)}
          </Pie>
          <Tooltip formatter={v=>fmtF(v)}/>
        </PieChart>
      </ResponsiveContainer>}
    </Card>

    <Card>
      <Sec>Detalle por categoría</Sec>
      <div style={{overflow:"auto"}}>
      <table style={{width:"100%",fontSize:12,borderCollapse:"collapse"}}>
        <thead>
          <tr style={{borderBottom:`2px solid ${C.gold}40`,color:C.gold,textAlign:"left"}}>
            <th style={{padding:"8px 6px"}}>Categoría</th>
            <th style={{padding:"8px 6px",textAlign:"right"}}>Prod.</th>
            <th style={{padding:"8px 6px",textAlign:"right"}}>Unid.</th>
            <th style={{padding:"8px 6px",textAlign:"right"}}>Inv. costo</th>
            <th style={{padding:"8px 6px",textAlign:"right"}}>Inv. venta</th>
            <th style={{padding:"8px 6px",textAlign:"right"}}>Util.</th>
            <th style={{padding:"8px 6px",textAlign:"right"}}>Margen %</th>
            <th style={{padding:"8px 6px",textAlign:"right"}}>Cero/Neg.</th>
          </tr>
        </thead>
        <tbody>
          {filas.sort((a,b)=>b.valorCosto-a.valorCosto).map((f,i)=>{
            const margen=f.valorVenta?(f.utilidad/f.valorVenta*100).toFixed(1):"0";
            return(<tr key={i} style={{borderBottom:`1px solid ${C.bdr}30`}}>
              <td style={{padding:"8px 6px",color:f.color,fontWeight:600}}>● {f.nombre}</td>
              <td style={{padding:"8px 6px",textAlign:"right"}}>{f.productos}</td>
              <td style={{padding:"8px 6px",textAlign:"right"}}>{f.unidades}</td>
              <td style={{padding:"8px 6px",textAlign:"right",color:C.gold,fontWeight:700}}>{fmtF(f.valorCosto)}</td>
              <td style={{padding:"8px 6px",textAlign:"right",color:C.muted}}>{fmtF(f.valorVenta)}</td>
              <td style={{padding:"8px 6px",textAlign:"right",color:C.green,fontWeight:700}}>{fmtF(f.utilidad)}</td>
              <td style={{padding:"8px 6px",textAlign:"right",color:Number(margen)>=50?C.green:Number(margen)>=30?C.gold:C.muted}}>{margen}%</td>
              <td style={{padding:"8px 6px",textAlign:"right",color:f.negativos>0?C.red:C.muted,fontWeight:f.negativos>0?700:400}}>{f.enCero}/{f.negativos}</td>
            </tr>);
          })}
          <tr style={{borderTop:`2px solid ${C.gold}`,fontWeight:800,color:C.gold,background:C.gold+"10"}}>
            <td style={{padding:"10px 6px"}}>TOTAL</td>
            <td style={{padding:"10px 6px",textAlign:"right"}}>{filas.reduce((a,f)=>a+f.productos,0)}</td>
            <td style={{padding:"10px 6px",textAlign:"right"}}>{filas.reduce((a,f)=>a+f.unidades,0)}</td>
            <td style={{padding:"10px 6px",textAlign:"right"}}>{fmtF(totalCosto)}</td>
            <td style={{padding:"10px 6px",textAlign:"right"}}>{fmtF(totalVenta)}</td>
            <td style={{padding:"10px 6px",textAlign:"right"}}>{fmtF(totalUtil)}</td>
            <td style={{padding:"10px 6px",textAlign:"right"}}>{totalVenta?(totalUtil/totalVenta*100).toFixed(1):"0"}%</td>
            <td style={{padding:"10px 6px",textAlign:"right"}}>{filas.reduce((a,f)=>a+f.enCero,0)}/{filas.reduce((a,f)=>a+f.negativos,0)}</td>
          </tr>
        </tbody>
      </table>
      </div>
    </Card>

    {filas.sort((a,b)=>b.valorCosto-a.valorCosto).map(f=>(
      <Card key={f.nombre} accent={f.color}>
        <Sec color={f.color}>● {f.nombre} · {fmtF(f.valorCosto)} al costo</Sec>
        <div style={{overflow:"auto"}}>
        <table style={{width:"100%",fontSize:12,borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.bdr}`,color:C.dim,textAlign:"left",fontSize:10,textTransform:"uppercase",letterSpacing:1}}>
              <th style={{padding:"6px"}}>Producto</th>
              <th style={{padding:"6px",textAlign:"right"}}>Saldo</th>
              <th style={{padding:"6px",textAlign:"right"}}>Compra</th>
              <th style={{padding:"6px",textAlign:"right"}}>Venta</th>
              <th style={{padding:"6px",textAlign:"right"}}>Inv. costo</th>
            </tr>
          </thead>
          <tbody>
            {f.items.sort((a,b)=>b.valorCosto-a.valorCosto).map((it,i)=>(
              <tr key={i} style={{borderBottom:`1px solid ${C.bdr}20`,background:it.saldo<0?C.red+"10":"transparent"}}>
                <td style={{padding:"6px"}}>{it.nombre}</td>
                <td style={{padding:"6px",textAlign:"right",fontWeight:700,color:it.saldo<0?C.red:it.saldo===0?C.dim:C.text}}>{it.saldo}</td>
                <td style={{padding:"6px",textAlign:"right",color:C.muted}}>{it.compra?fmtF(it.compra):"—"}</td>
                <td style={{padding:"6px",textAlign:"right",color:C.muted}}>{it.venta?fmtF(it.venta):"insumo"}</td>
                <td style={{padding:"6px",textAlign:"right",color:C.gold,fontWeight:600}}>{it.valorCosto?fmtF(it.valorCosto):"—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    ))}
  </div>);
}

// ═════════════════════════════════════════════════════════════════
// ─── COMPRAS (módulo de facturas por proveedor) ───
// ═════════════════════════════════════════════════════════════════
// ─── BarModule: analítica de ventas de bar/coctelería con precios, validación cuadre y márgenes ───
function BarModule({bar,cuadres,catalog}){
  const [mes,setMes]=useState("2026-05");
  const [diaSel,setDiaSel]=useState(null);

  const monthBar=useMemo(()=>(bar||[]).filter(b=>b.date.startsWith(mes)).sort((a,b)=>a.date.localeCompare(b.date)),[bar,mes]);
  const allMonths=useMemo(()=>Array.from(new Set((bar||[]).map(b=>b.date.slice(0,7)))).sort(),[bar]);
  const cat=catalog||{};

  if(!bar||bar.length===0) return(<div style={{textAlign:"center",padding:60,color:C.dim}}><h2 style={{color:C.gold}}>🍸 Bar/Coctelería</h2><p>Sin reportes de bar registrados aún.</p><p style={{fontSize:12,marginTop:8}}>Se empezó a tracking el 25 may 2026.</p></div>);

  // Helper: calcular sumas y márgenes por día
  const computeDay=(b)=>{
    const procItem=(p)=>{
      const costo=cat[p.nombre]?.compra||0;
      const totalItem=p.total!=null?p.total:(p.cantidad*(p.precio_unit||0));
      const totalCosto=p.cantidad*costo;
      const margen=totalItem-totalCosto;
      const margenPct=totalItem>0?(margen/totalItem*100):0;
      return{...p,total:totalItem,costo_unit:costo,total_costo:totalCosto,margen,margen_pct:margenPct};
    };
    const estancoItems=(b.estanco||[]).map(procItem);
    const coctelesItems=(b.cocteles||[]).map(procItem);
    const sumEstanco=estancoItems.reduce((s,p)=>s+p.total,0);
    const sumCocteles=coctelesItems.reduce((s,p)=>s+p.total,0);
    const sumCostoEstanco=estancoItems.reduce((s,p)=>s+p.total_costo,0);
    const sumCostoCocteles=coctelesItems.reduce((s,p)=>s+p.total_costo,0);
    return{...b,estancoItems,coctelesItems,sumEstanco,sumCocteles,sumCostoEstanco,sumCostoCocteles,
      margenEstanco:sumEstanco-sumCostoEstanco,margenCocteles:sumCocteles-sumCostoCocteles};
  };
  const monthBarProc=monthBar.map(computeDay);

  // Totales del mes
  const totalEstanco=monthBarProc.reduce((s,b)=>s+(b.total_estanco||0),0);
  const totalCocteles=monthBarProc.reduce((s,b)=>s+(b.total_cocteles||0),0);
  const totalBar=totalEstanco+totalCocteles;
  const totalUnits=monthBarProc.reduce((s,b)=>s+(b.total_units||0),0);
  const sumEstancoMes=monthBarProc.reduce((s,b)=>s+b.sumEstanco,0);
  const sumCoctelesMes=monthBarProc.reduce((s,b)=>s+b.sumCocteles,0);
  const margenEstancoMes=monthBarProc.reduce((s,b)=>s+b.margenEstanco,0);
  const margenCoctelesMes=monthBarProc.reduce((s,b)=>s+b.margenCocteles,0);
  const totalCostoMes=monthBarProc.reduce((s,b)=>s+b.sumCostoEstanco+b.sumCostoCocteles,0);
  const margenTotalMes=(sumEstancoMes+sumCoctelesMes)-totalCostoMes;
  const margenPctMes=totalBar>0?(margenTotalMes/(sumEstancoMes+sumCoctelesMes)*100):0;
  const avgPorDia=monthBarProc.length>0?Math.round(totalBar/monthBarProc.length):0;
  const avgUnitsPorDia=monthBarProc.length>0?(totalUnits/monthBarProc.length).toFixed(1):0;
  const pctEstanco=totalBar>0?Math.round(totalEstanco/totalBar*100):0;
  const pctCocteles=100-pctEstanco;

  // Validación global cuadre vs sumas calculadas
  const diffEstancoMes=sumEstancoMes-totalEstanco;
  const diffCoctelesMes=sumCoctelesMes-totalCocteles;

  // Agregar productos mes con valores
  const estancoMap={},coctelesMap={};
  monthBarProc.forEach(b=>{
    b.estancoItems.forEach(p=>{
      if(!estancoMap[p.nombre]) estancoMap[p.nombre]={cant:0,valor:0,costo:0,margen:0};
      estancoMap[p.nombre].cant+=p.cantidad; estancoMap[p.nombre].valor+=p.total;
      estancoMap[p.nombre].costo+=p.total_costo; estancoMap[p.nombre].margen+=p.margen;
    });
    b.coctelesItems.forEach(p=>{
      if(!coctelesMap[p.nombre]) coctelesMap[p.nombre]={cant:0,valor:0,costo:0,margen:0};
      coctelesMap[p.nombre].cant+=p.cantidad; coctelesMap[p.nombre].valor+=p.total;
      coctelesMap[p.nombre].costo+=p.total_costo; coctelesMap[p.nombre].margen+=p.margen;
    });
  });
  const topEstanco=Object.entries(estancoMap).sort((a,b)=>b[1].valor-a[1].valor);
  const topCocteles=Object.entries(coctelesMap).sort((a,b)=>b[1].valor-a[1].valor);
  const totalEstancoUnits=topEstanco.reduce((s,[,d])=>s+d.cant,0);
  const totalCoctelesUnits=topCocteles.reduce((s,[,d])=>s+d.cant,0);

  // Día seleccionado
  const diaData=diaSel?monthBarProc.find(b=>b.date===diaSel):null;
  const diaCuadre=diaSel?(cuadres||[]).find(c=>c.date===diaSel):null;

  // Tendencia diaria chart
  const dailyChart=monthBarProc.map(b=>({fecha:fmtD(b.date).split(" ")[0]+" "+fmtD(b.date).split(" ")[1].slice(0,3),estanco:b.total_estanco||0,cocteles:b.total_cocteles||0}));

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:14,flexWrap:"wrap",gap:8}}>
      <h2 style={{fontFamily:"'Poppins',sans-serif",fontSize:22,color:C.gold,margin:0}}>🍸 Bar / Coctelería</h2>
      <select value={mes} onChange={e=>{setMes(e.target.value);setDiaSel(null);}} style={{background:C.bg2,color:C.text,border:`1px solid ${C.bdr}`,borderRadius:8,padding:"6px 12px",fontSize:13,fontFamily:"inherit"}}>
        {allMonths.map(m=><option key={m} value={m}>{m}</option>)}
      </select>
    </div>

    {/* Resumen del mes con margen */}
    <Card accent={C.gold} style={{background:C.gold+"08"}}>
      <Sec color={C.gold}>Resumen del mes</Sec>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:14,marginTop:8}}>
        <div>
          <div style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:1.2,fontWeight:700}}>Venta bar</div>
          <div style={{fontSize:22,fontWeight:800,color:C.gold,fontFamily:"'Poppins',sans-serif",marginTop:2,fontVariantNumeric:"tabular-nums"}}>{fmtF(totalBar)}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:1}}>{monthBarProc.length} día{monthBarProc.length===1?"":"s"} · {totalUnits} unds</div>
        </div>
        <div>
          <div style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:1.2,fontWeight:700}}>Costo insumos</div>
          <div style={{fontSize:22,fontWeight:800,color:C.red,fontFamily:"'Poppins',sans-serif",marginTop:2,fontVariantNumeric:"tabular-nums"}}>{fmtF(totalCostoMes)}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:1}}>desde CATALOG</div>
        </div>
        <div>
          <div style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:1.2,fontWeight:700}}>Margen bruto</div>
          <div style={{fontSize:22,fontWeight:800,color:C.green,fontFamily:"'Poppins',sans-serif",marginTop:2,fontVariantNumeric:"tabular-nums"}}>{fmtF(margenTotalMes)}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:1}}>{margenPctMes.toFixed(1)}% margen</div>
        </div>
        <div>
          <div style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:1.2,fontWeight:700}}>Promedio/día</div>
          <div style={{fontSize:22,fontWeight:800,color:C.text,fontFamily:"'Poppins',sans-serif",marginTop:2,fontVariantNumeric:"tabular-nums"}}>{fmtF(avgPorDia)}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:1}}>{avgUnitsPorDia} unds/día</div>
        </div>
      </div>
    </Card>

    {/* Validación cuadre vs sumas */}
    {(diffEstancoMes!==0||diffCoctelesMes!==0)&&<Card accent={C.orange} style={{background:C.orange+"08"}}>
      <Sec color={C.orange}>⚠ Validación contra cuadre</Sec>
      <div style={{fontSize:12,color:C.muted,marginBottom:8}}>Diferencias entre la suma de items × precio_unit y los totales del cuadre POS:</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={{padding:"10px 12px",background:C.bg,borderRadius:8,borderLeft:`3px solid ${diffEstancoMes===0?C.green:C.orange}`}}>
          <div style={{fontSize:11,color:C.dim,textTransform:"uppercase",fontWeight:700}}>Estanco</div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginTop:4}}><span style={{color:C.muted}}>Suma items:</span><span style={{fontVariantNumeric:"tabular-nums"}}>{fmtF(sumEstancoMes)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:C.muted}}>Cuadre POS:</span><span style={{fontVariantNumeric:"tabular-nums"}}>{fmtF(totalEstanco)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700,marginTop:3,paddingTop:3,borderTop:`1px solid ${C.bdr}`,color:diffEstancoMes===0?C.green:C.orange}}><span>Dif:</span><span style={{fontVariantNumeric:"tabular-nums"}}>{diffEstancoMes>=0?"+":""}{fmtF(diffEstancoMes)}</span></div>
        </div>
        <div style={{padding:"10px 12px",background:C.bg,borderRadius:8,borderLeft:`3px solid ${diffCoctelesMes===0?C.green:C.orange}`}}>
          <div style={{fontSize:11,color:C.dim,textTransform:"uppercase",fontWeight:700}}>Cócteles</div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginTop:4}}><span style={{color:C.muted}}>Suma items:</span><span style={{fontVariantNumeric:"tabular-nums"}}>{fmtF(sumCoctelesMes)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:C.muted}}>Cuadre POS:</span><span style={{fontVariantNumeric:"tabular-nums"}}>{fmtF(totalCocteles)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700,marginTop:3,paddingTop:3,borderTop:`1px solid ${C.bdr}`,color:diffCoctelesMes===0?C.green:C.orange}}><span>Dif:</span><span style={{fontVariantNumeric:"tabular-nums"}}>{diffCoctelesMes>=0?"+":""}{fmtF(diffCoctelesMes)}</span></div>
        </div>
      </div>
    </Card>}
    {(diffEstancoMes===0&&diffCoctelesMes===0)&&<Card accent={C.green} style={{background:C.green+"08"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:24}}>✓</span>
        <div><div style={{color:C.green,fontWeight:700,fontSize:14}}>Sumas validadas vs cuadre</div><div style={{fontSize:12,color:C.muted}}>Todos los precios y cantidades cuadran con el POS.</div></div>
      </div>
    </Card>}

    {/* Estanco vs Cocteles */}
    <Card>
      <Sec>Estanco vs Cócteles</Sec>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:6}}>
        <div style={{padding:"14px 16px",background:C.bg,borderRadius:10,borderLeft:`3px solid ${C.cyan}`}}>
          <div style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:1.2,fontWeight:700}}>📦 Estanco</div>
          <div style={{fontSize:22,fontWeight:800,color:C.cyan,marginTop:4,fontVariantNumeric:"tabular-nums"}}>{fmtF(totalEstanco)}</div>
          <div style={{fontSize:12,color:C.muted,marginTop:2}}>{pctEstanco}% · {totalEstancoUnits} unds · Margen {fmtF(margenEstancoMes)}</div>
        </div>
        <div style={{padding:"14px 16px",background:C.bg,borderRadius:10,borderLeft:`3px solid ${C.gold}`}}>
          <div style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:1.2,fontWeight:700}}>🍹 Cócteles</div>
          <div style={{fontSize:22,fontWeight:800,color:C.gold,marginTop:4,fontVariantNumeric:"tabular-nums"}}>{fmtF(totalCocteles)}</div>
          <div style={{fontSize:12,color:C.muted,marginTop:2}}>{pctCocteles}% · {totalCoctelesUnits} unds · Margen {fmtF(margenCoctelesMes)}</div>
        </div>
      </div>
      <div style={{marginTop:14,height:16,background:C.bg,borderRadius:8,overflow:"hidden",display:"flex"}}>
        <div style={{width:pctEstanco+"%",background:C.cyan,height:"100%",transition:"width 0.3s"}}/>
        <div style={{width:pctCocteles+"%",background:C.gold,height:"100%",transition:"width 0.3s"}}/>
      </div>
    </Card>

    {/* Top cocteles con margen */}
    {topCocteles.length>0&&<Card>
      <Sec color={C.gold}>🍹 Ranking Cócteles ({totalCoctelesUnits} unds)</Sec>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
          <thead><tr style={{color:C.gold,textAlign:"left",borderBottom:`1px solid ${C.gold}40`}}>
            <th style={{padding:"6px 6px"}}>#</th><th style={{padding:"6px 6px"}}>Coctel</th>
            <th style={{padding:"6px 6px",textAlign:"center"}}>Cant</th>
            <th style={{padding:"6px 6px",textAlign:"right"}}>Venta</th>
            <th style={{padding:"6px 6px",textAlign:"right"}}>Costo</th>
            <th style={{padding:"6px 6px",textAlign:"right"}}>Margen</th>
            <th style={{padding:"6px 6px",textAlign:"right"}}>%</th>
          </tr></thead>
          <tbody>
            {topCocteles.map(([nombre,d],i)=>{
              const mPct=d.valor>0?(d.margen/d.valor*100):0;
              return(<tr key={nombre} style={{borderBottom:`1px solid ${C.bdr}30`}}>
                <td style={{padding:"7px 6px",color:i===0?C.gold:i===1?C.orange:C.dim,fontWeight:700}}>#{i+1}</td>
                <td style={{padding:"7px 6px",color:C.text,fontWeight:i<3?600:400}}>{nombre}</td>
                <td style={{padding:"7px 6px",textAlign:"center",color:C.muted}}>{d.cant}</td>
                <td style={{padding:"7px 6px",textAlign:"right",color:C.gold,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmtF(d.valor)}</td>
                <td style={{padding:"7px 6px",textAlign:"right",color:d.costo>0?C.red:C.muted,fontVariantNumeric:"tabular-nums"}}>{d.costo>0?fmtF(d.costo):"—"}</td>
                <td style={{padding:"7px 6px",textAlign:"right",color:d.costo>0?C.green:C.muted,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{d.costo>0?fmtF(d.margen):"—"}</td>
                <td style={{padding:"7px 6px",textAlign:"right",color:d.costo>0?C.green:C.muted,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{d.costo>0?mPct.toFixed(0)+"%":"—"}</td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </Card>}

    {/* Top estanco con margen */}
    {topEstanco.length>0&&<Card>
      <Sec color={C.cyan}>📦 Ranking Estanco ({totalEstancoUnits} unds)</Sec>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
          <thead><tr style={{color:C.cyan,textAlign:"left",borderBottom:`1px solid ${C.cyan}40`}}>
            <th style={{padding:"6px 6px"}}>#</th><th style={{padding:"6px 6px"}}>Producto</th>
            <th style={{padding:"6px 6px",textAlign:"center"}}>Cant</th>
            <th style={{padding:"6px 6px",textAlign:"right"}}>Venta</th>
            <th style={{padding:"6px 6px",textAlign:"right"}}>Costo</th>
            <th style={{padding:"6px 6px",textAlign:"right"}}>Margen</th>
            <th style={{padding:"6px 6px",textAlign:"right"}}>%</th>
          </tr></thead>
          <tbody>
            {topEstanco.map(([nombre,d],i)=>{
              const mPct=d.valor>0?(d.margen/d.valor*100):0;
              return(<tr key={nombre} style={{borderBottom:`1px solid ${C.bdr}30`}}>
                <td style={{padding:"7px 6px",color:i===0?C.cyan:i===1?C.orange:C.dim,fontWeight:700}}>#{i+1}</td>
                <td style={{padding:"7px 6px",color:C.text,fontWeight:i<3?600:400}}>{nombre}</td>
                <td style={{padding:"7px 6px",textAlign:"center",color:C.muted}}>{d.cant}</td>
                <td style={{padding:"7px 6px",textAlign:"right",color:C.cyan,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmtF(d.valor)}</td>
                <td style={{padding:"7px 6px",textAlign:"right",color:d.costo>0?C.red:C.muted,fontVariantNumeric:"tabular-nums"}}>{d.costo>0?fmtF(d.costo):"—"}</td>
                <td style={{padding:"7px 6px",textAlign:"right",color:d.costo>0?C.green:C.muted,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{d.costo>0?fmtF(d.margen):"—"}</td>
                <td style={{padding:"7px 6px",textAlign:"right",color:d.costo>0?C.green:C.muted,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{d.costo>0?mPct.toFixed(0)+"%":"—"}</td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </Card>}

    {/* Tendencia diaria */}
    {monthBarProc.length>1&&<Card>
      <Sec>Tendencia diaria</Sec>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={dailyChart} margin={{top:10,right:10,left:0,bottom:10}}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.bdr}/>
          <XAxis dataKey="fecha" stroke={C.dim} style={{fontSize:11}}/>
          <YAxis stroke={C.dim} style={{fontSize:10}} tickFormatter={v=>v>=1000?(v/1000)+"k":v}/>
          <Tooltip formatter={v=>fmtF(v)} contentStyle={{background:C.bg2,border:`1px solid ${C.bdr}`,borderRadius:8}}/>
          <Bar dataKey="estanco" stackId="a" fill={C.cyan} name="Estanco"/>
          <Bar dataKey="cocteles" stackId="a" fill={C.gold} name="Cócteles"/>
        </BarChart>
      </ResponsiveContainer>
    </Card>}

    {/* Tabla detalle diario */}
    <Card>
      <Sec>Detalle diario</Sec>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{color:C.gold,textAlign:"left",borderBottom:`1px solid ${C.gold}40`}}>
            <th style={{padding:"8px 6px"}}>Fecha</th>
            <th style={{padding:"8px 6px",textAlign:"right"}}>Estanco</th>
            <th style={{padding:"8px 6px",textAlign:"right"}}>Cócteles</th>
            <th style={{padding:"8px 6px",textAlign:"right"}}>Total</th>
            <th style={{padding:"8px 6px",textAlign:"center"}}>Unds</th>
            <th style={{padding:"8px 6px",textAlign:"right"}}>Margen</th>
            <th style={{padding:"8px 6px",textAlign:"center"}}>Ver</th>
          </tr></thead>
          <tbody>
            {monthBarProc.map((b,i)=>{
              const margenDia=b.margenEstanco+b.margenCocteles;
              return(<tr key={i} style={{borderBottom:`1px solid ${C.bdr}40`,background:diaSel===b.date?C.gold+"10":"transparent"}}>
                <td style={{padding:"9px 6px",color:C.text,fontWeight:600}}>{fmtD(b.date).replace(" 2026","")}</td>
                <td style={{padding:"9px 6px",textAlign:"right",color:C.cyan,fontVariantNumeric:"tabular-nums"}}>{fmtF(b.total_estanco||0)}</td>
                <td style={{padding:"9px 6px",textAlign:"right",color:C.gold,fontVariantNumeric:"tabular-nums"}}>{fmtF(b.total_cocteles||0)}</td>
                <td style={{padding:"9px 6px",textAlign:"right",color:C.text,fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{fmtF((b.total_estanco||0)+(b.total_cocteles||0))}</td>
                <td style={{padding:"9px 6px",textAlign:"center",color:C.muted}}>{b.total_units||0}</td>
                <td style={{padding:"9px 6px",textAlign:"right",color:C.green,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmtF(margenDia)}</td>
                <td style={{padding:"9px 6px",textAlign:"center"}}>
                  <button onClick={()=>setDiaSel(diaSel===b.date?null:b.date)} style={{background:diaSel===b.date?C.gold:"transparent",color:diaSel===b.date?C.bg:C.gold,border:`1px solid ${C.gold}`,borderRadius:6,padding:"3px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>{diaSel===b.date?"Cerrar":"Detalle"}</button>
                </td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </Card>

    {/* Detalle del día seleccionado con tabla completa */}
    {diaData&&<Card accent={C.gold}>
      <Sec color={C.gold}>📋 Detalle: {fmtD(diaData.date)}</Sec>
      {diaCuadre&&<div style={{fontSize:12,color:C.muted,marginBottom:10}}>Cuadre POS: Estanco {fmtF(diaCuadre.estanco)} · Cócteles {fmtF(diaCuadre.cocteles)}</div>}
      
      {/* Estanco detalle */}
      <div style={{marginBottom:18}}>
        <div style={{fontSize:13,color:C.cyan,textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:8}}>📦 Estanco · {fmtF(diaData.sumEstanco)} {diaCuadre&&diaCuadre.estanco!==diaData.sumEstanco&&<span style={{color:C.orange,fontWeight:500,textTransform:"none",fontSize:11,marginLeft:8}}>(cuadre: {fmtF(diaCuadre.estanco)}, dif {diaData.sumEstanco-diaCuadre.estanco>=0?"+":""}{fmtF(diaData.sumEstanco-diaCuadre.estanco)})</span>}</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
            <thead><tr style={{color:C.dim,textAlign:"left",borderBottom:`1px solid ${C.bdr}`}}>
              <th style={{padding:"5px 6px"}}>Producto</th>
              <th style={{padding:"5px 6px",textAlign:"center"}}>Cant</th>
              <th style={{padding:"5px 6px",textAlign:"right"}}>PVP</th>
              <th style={{padding:"5px 6px",textAlign:"right"}}>Total</th>
              <th style={{padding:"5px 6px",textAlign:"right"}}>Costo/u</th>
              <th style={{padding:"5px 6px",textAlign:"right"}}>Margen</th>
              <th style={{padding:"5px 6px",textAlign:"right"}}>%</th>
            </tr></thead>
            <tbody>
              {diaData.estancoItems.map((p,i)=>{
                const mPct=p.total>0?(p.margen/p.total*100):0;
                return(<tr key={i} style={{borderBottom:`1px solid ${C.bdr}20`}}>
                  <td style={{padding:"6px",color:C.text}}>{p.nombre}{p.nota&&<div style={{fontSize:10,color:C.orange,marginTop:1}}>⚠ {p.nota}</div>}</td>
                  <td style={{padding:"6px",textAlign:"center",color:C.cyan,fontWeight:700}}>{p.cantidad}</td>
                  <td style={{padding:"6px",textAlign:"right",color:C.text,fontVariantNumeric:"tabular-nums"}}>{p.precio_unit>0?fmtF(p.precio_unit):"—"}</td>
                  <td style={{padding:"6px",textAlign:"right",color:C.cyan,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmtF(p.total)}</td>
                  <td style={{padding:"6px",textAlign:"right",color:p.costo_unit>0?C.red:C.muted,fontVariantNumeric:"tabular-nums"}}>{p.costo_unit>0?fmtF(p.costo_unit):"—"}</td>
                  <td style={{padding:"6px",textAlign:"right",color:p.costo_unit>0?C.green:C.muted,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{p.costo_unit>0?fmtF(p.margen):"—"}</td>
                  <td style={{padding:"6px",textAlign:"right",color:p.costo_unit>0?C.green:C.muted,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{p.costo_unit>0&&p.total>0?mPct.toFixed(0)+"%":"—"}</td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Cocteles detalle */}
      <div>
        <div style={{fontSize:13,color:C.gold,textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:8}}>🍹 Cócteles · {fmtF(diaData.sumCocteles)} {diaCuadre&&diaCuadre.cocteles!==diaData.sumCocteles&&<span style={{color:C.orange,fontWeight:500,textTransform:"none",fontSize:11,marginLeft:8}}>(cuadre: {fmtF(diaCuadre.cocteles)}, dif {diaData.sumCocteles-diaCuadre.cocteles>=0?"+":""}{fmtF(diaData.sumCocteles-diaCuadre.cocteles)})</span>}</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
            <thead><tr style={{color:C.dim,textAlign:"left",borderBottom:`1px solid ${C.bdr}`}}>
              <th style={{padding:"5px 6px"}}>Coctel</th>
              <th style={{padding:"5px 6px",textAlign:"center"}}>Cant</th>
              <th style={{padding:"5px 6px",textAlign:"right"}}>PVP</th>
              <th style={{padding:"5px 6px",textAlign:"right"}}>Total</th>
              <th style={{padding:"5px 6px",textAlign:"right"}}>Costo/u</th>
              <th style={{padding:"5px 6px",textAlign:"right"}}>Margen</th>
              <th style={{padding:"5px 6px",textAlign:"right"}}>%</th>
            </tr></thead>
            <tbody>
              {diaData.coctelesItems.map((p,i)=>{
                const mPct=p.total>0?(p.margen/p.total*100):0;
                return(<tr key={i} style={{borderBottom:`1px solid ${C.bdr}20`}}>
                  <td style={{padding:"6px",color:C.text}}>{p.nombre}{p.nota&&<div style={{fontSize:10,color:C.orange,marginTop:1}}>⚠ {p.nota}</div>}</td>
                  <td style={{padding:"6px",textAlign:"center",color:C.gold,fontWeight:700}}>{p.cantidad}</td>
                  <td style={{padding:"6px",textAlign:"right",color:C.text,fontVariantNumeric:"tabular-nums"}}>{p.precio_unit>0?fmtF(p.precio_unit):"—"}</td>
                  <td style={{padding:"6px",textAlign:"right",color:C.gold,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fmtF(p.total)}</td>
                  <td style={{padding:"6px",textAlign:"right",color:p.costo_unit>0?C.red:C.muted,fontVariantNumeric:"tabular-nums"}}>{p.costo_unit>0?fmtF(p.costo_unit):"—"}</td>
                  <td style={{padding:"6px",textAlign:"right",color:p.costo_unit>0?C.green:C.muted,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{p.costo_unit>0?fmtF(p.margen):"—"}</td>
                  <td style={{padding:"6px",textAlign:"right",color:p.costo_unit>0?C.green:C.muted,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{p.costo_unit>0&&p.total>0?mPct.toFixed(0)+"%":"—"}</td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
        <div style={{marginTop:10,padding:"8px 10px",background:C.bg,borderRadius:6,fontSize:11,color:C.muted,lineHeight:1.5}}>
          ⓘ Costo unitario tomado del CATALOG (precio compra del insumo principal). Para cócteles que combinan múltiples insumos, el costo real puede ser más alto. Margen mostrado como aproximación.
        </div>
      </div>
    </Card>}
  </div>);
}

function ComprasModule({compras,cartera}){
  const HOY="2026-08-08";
  if((!compras||compras.length===0)&&(!cartera||cartera.length===0)){
    return(<div>
      <Card accent={C.gold}>
        <Sec color={C.gold}>🧾 Módulo de Compras</Sec>
        <p style={{fontSize:14,color:C.text,lineHeight:1.6,marginBottom:12}}>
          Aquí se registrarán todas las facturas de proveedores con detalle por producto.
        </p>
        <p style={{fontSize:13,color:C.muted,lineHeight:1.5}}>
          <strong style={{color:C.gold}}>Para empezar:</strong> envía las imágenes de las facturas a Claude. Se digitalizan y cargan con el cruce contra el catálogo.
        </p>
      </Card>
    </div>);
  }

  // ─── Agrupar compras por proveedor ───
  const porProveedor={};
  (compras||[]).forEach(f=>{
    if(!porProveedor[f.proveedor])porProveedor[f.proveedor]={facturas:[],total:0,unidades:0};
    porProveedor[f.proveedor].facturas.push(f);
    f.items?.forEach(it=>{
      porProveedor[f.proveedor].total+=it.vr_total||0;
      porProveedor[f.proveedor].unidades+=it.cant||0;
    });
  });
  const proveedores=Object.entries(porProveedor).sort((a,b)=>b[1].total-a[1].total);
  const totalCompras=proveedores.reduce((a,[,d])=>a+d.total,0);

  // ─── Cartera (cuentas por pagar) ───
  const cart=cartera||[];
  const pend=cart.filter(c=>c.estado!=="cancelada");
  const totalPend=pend.reduce((a,c)=>a+(c.valor||0),0);
  const totalCanc=cart.filter(c=>c.estado==="cancelada").reduce((a,c)=>a+(c.valor||0),0);
  const vencidas=pend.filter(c=>c.vence<HOY);
  const porVencer=pend.filter(c=>c.vence>=HOY);
  const totalVenc=vencidas.reduce((a,c)=>a+(c.valor||0),0);
  const dias=(d)=>{const a=new Date(HOY+"T12:00:00"),b=new Date(d+"T12:00:00");return Math.round((b-a)/86400000);};

  return(<div>
    {cart.length>0&&<>
      <Card accent={totalVenc>0?C.red:C.gold}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,flexWrap:"wrap"}}>
          <div><Sec color={C.gold}>💳 Cuentas por pagar</Sec>
            <div style={{fontSize:12,color:C.dim}}>{Array.from(new Set(cart.map(c=>c.proveedor))).length} proveedores · {cart.length} facturas registradas</div></div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>Saldo pendiente</div>
            <div style={{fontSize:26,fontWeight:800,color:C.gold,marginTop:2,fontVariantNumeric:"tabular-nums"}}>{fmtF(totalPend)}</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:14}}>
          <div style={{background:C.bg,borderRadius:12,padding:"12px 14px",border:`1px solid ${C.redDim}`}}>
            <div style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>Vencidas</div>
            <div style={{fontSize:19,fontWeight:800,color:C.red,marginTop:4,fontVariantNumeric:"tabular-nums"}}>{fmtF(totalVenc)}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{vencidas.length} factura{vencidas.length===1?"":"s"}</div>
          </div>
          <div style={{background:C.bg,borderRadius:12,padding:"12px 14px",border:`1px solid ${C.bdr}`}}>
            <div style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>Por vencer</div>
            <div style={{fontSize:19,fontWeight:800,color:C.text,marginTop:4,fontVariantNumeric:"tabular-nums"}}>{fmtF(totalPend-totalVenc)}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{porVencer.length} factura{porVencer.length===1?"":"s"}</div>
          </div>
          <div style={{background:C.bg,borderRadius:12,padding:"12px 14px",border:`1px solid ${C.greenDim}`}}>
            <div style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>Canceladas</div>
            <div style={{fontSize:19,fontWeight:800,color:C.green,marginTop:4,fontVariantNumeric:"tabular-nums"}}>{fmtF(totalCanc)}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{cart.filter(c=>c.estado==="cancelada").length} factura{cart.filter(c=>c.estado==="cancelada").length===1?"":"s"}</div>
          </div>
        </div>
        <div style={{marginTop:12,padding:"9px 12px",background:C.gold+"12",border:`1px solid ${C.gold}40`,borderRadius:9,fontSize:12,color:C.text,lineHeight:1.5}}>
          Cartera agrupada por proveedor abajo. Vencidas en rojo, próximas a vencer (≤7 días) en amarillo.
        </div>
      </Card>

      <Card>
        <Sec>Detalle de cartera por proveedor</Sec>
        {(()=>{
          // Agrupar cartera por proveedor
          const porProv={};
          cart.forEach(c=>{
            const p=c.proveedor||"Sin proveedor";
            if(!porProv[p]) porProv[p]={facturas:[],pend:0,canc:0,venc:0};
            porProv[p].facturas.push(c);
            if(c.estado==="cancelada") porProv[p].canc+=c.valor||0;
            else{porProv[p].pend+=c.valor||0; if(c.vence<HOY) porProv[p].venc+=c.valor||0;}
          });
          // Ordenar proveedores: primero los que tienen pendiente, mayor primero
          const sortedProvs=Object.entries(porProv).sort((a,b)=>(b[1].pend-a[1].pend)||(b[1].canc-a[1].canc));
          return sortedProvs.map(([prov,data])=>(
            <div key={prov} style={{marginBottom:18,background:C.bg,borderRadius:10,padding:"12px 14px",border:`1px solid ${data.venc>0?C.redDim:C.bdr}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10,flexWrap:"wrap",gap:8}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:C.text}}>{prov}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:1}}>{data.facturas.length} factura{data.facturas.length===1?"":"s"}</div>
                </div>
                <div style={{display:"flex",gap:14,fontSize:12,alignItems:"baseline"}}>
                  {data.pend>0&&<div style={{textAlign:"right"}}>
                    <div style={{fontSize:9,color:C.dim,textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>Pendiente</div>
                    <div style={{fontSize:15,fontWeight:800,color:data.venc>0?C.red:C.gold,fontVariantNumeric:"tabular-nums"}}>{fmtF(data.pend)}</div>
                  </div>}
                  {data.canc>0&&<div style={{textAlign:"right"}}>
                    <div style={{fontSize:9,color:C.dim,textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>Cancelado</div>
                    <div style={{fontSize:15,fontWeight:800,color:C.green,fontVariantNumeric:"tabular-nums"}}>{fmtF(data.canc)}</div>
                  </div>}
                </div>
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
                  <thead><tr style={{color:C.gold,textAlign:"left",borderBottom:`1px solid ${C.gold}40`}}>
                    <th style={{padding:"6px 6px"}}>Factura</th>
                    <th style={{padding:"6px 6px"}}>Emisión</th>
                    <th style={{padding:"6px 6px"}}>Vence</th>
                    <th style={{padding:"6px 6px",textAlign:"right"}}>Valor</th>
                    <th style={{padding:"6px 6px",textAlign:"center"}}>Días</th>
                    <th style={{padding:"6px 6px",textAlign:"center"}}>Detalle</th>
                    <th style={{padding:"6px 6px",textAlign:"center"}}>Estado</th>
                  </tr></thead>
                  <tbody>
                    {data.facturas.slice().sort((a,b)=>a.fecha.localeCompare(b.fecha)).map((c,i)=>{
                      const d=dias(c.vence), venc=c.estado!=="cancelada"&&c.vence<HOY;
                      return(<tr key={i} style={{borderBottom:`1px solid ${C.bdr}40`,background:venc?C.red+"0d":"transparent"}}>
                        <td style={{padding:"7px 6px",fontWeight:700,color:C.gold,fontSize:12}}>{c.factura}</td>
                        <td style={{padding:"7px 6px",color:C.dim}}>{fmtD(c.fecha).replace(" 2026","")}</td>
                        <td style={{padding:"7px 6px",color:venc?C.red:C.text}}>{fmtD(c.vence).replace(" 2026","")}</td>
                        <td style={{padding:"7px 6px",textAlign:"right",fontWeight:600,color:C.text,fontVariantNumeric:"tabular-nums"}}>{fmtF(c.valor)}</td>
                        <td style={{padding:"7px 6px",textAlign:"center",color:c.estado==="cancelada"?C.muted:venc?C.red:d<=7?C.gold:C.muted,fontWeight:venc?700:500}}>{c.estado==="cancelada"?"—":venc?`${Math.abs(d)}d venc.`:`${d}d`}</td>
                        <td style={{padding:"7px 6px",textAlign:"center"}}>{c.detalle?<span style={{color:C.green}}>✓</span>:<span style={{color:C.muted}}>—</span>}</td>
                        <td style={{padding:"7px 6px",textAlign:"center"}}><span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:6,background:c.estado==="cancelada"?C.greenDim:venc?C.redDim:C.bdr,color:c.estado==="cancelada"?C.green:venc?C.red:C.dim}}>{c.estado==="cancelada"?"Cancelada":"Pendiente"}</span></td>
                      </tr>);
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ));
        })()}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"12px 14px",background:C.gold+"10",borderRadius:10,border:`2px solid ${C.gold}`,fontWeight:800,color:C.gold,fontSize:14,marginTop:6}}>
          <span>SALDO PENDIENTE TOTAL ({pend.length} factura{pend.length===1?"":"s"})</span>
          <span style={{fontSize:18,fontVariantNumeric:"tabular-nums"}}>{fmtF(totalPend)}</span>
        </div>
      </Card>
    </>}

    {compras&&compras.length>0&&<>
      <Card accent={C.gold}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,gap:10}}>
          <div>
            <Sec color={C.gold}>🧾 Compras registradas (detalle)</Sec>
            <div style={{fontSize:13,color:C.dim}}>{compras.length} facturas con detalle · {proveedores.length} proveedor{proveedores.length===1?"":"es"}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>Total facturado</div>
            <div style={{fontSize:26,fontWeight:800,color:C.gold,marginTop:4,fontVariantNumeric:"tabular-nums"}}>{fmtF(totalCompras)}</div>
          </div>
        </div>
      </Card>

      {proveedores.map(([prov,data])=>(
        <Card key={prov} accent={C.gold}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:C.text}}>{prov}</div>
              <div style={{fontSize:11,color:C.muted}}>{data.facturas.length} facturas · {data.unidades} unidades</div>
            </div>
            <div style={{fontSize:18,fontWeight:800,color:C.gold,fontVariantNumeric:"tabular-nums"}}>{fmtF(data.total)}</div>
          </div>
          {data.facturas.slice().sort((a,b)=>b.fecha.localeCompare(a.fecha)).map((f,i)=>{
            const tot=f.items?.reduce((a,it)=>a+(it.vr_total||0),0)||0;
            const cruz=f.items?.filter(it=>it.producto_jsx&&CATALOG[it.producto_jsx]).length||0;
            return(<div key={i} style={{background:C.bg,padding:"10px 12px",borderRadius:8,marginTop:8,border:`1px solid ${C.bdr}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:4}}>
                <div style={{fontSize:12,fontWeight:600,color:C.gold}}>Factura {f.factura} · {fmtD(f.fecha)} · vence {fmtD(f.vence).replace(" 2026","")}</div>
                <div style={{fontSize:13,fontWeight:700,color:C.text,fontVariantNumeric:"tabular-nums"}}>{fmtF(tot)}</div>
              </div>
              <div style={{fontSize:10,color:C.muted,marginBottom:6}}>{cruz}/{f.items?.length||0} ítems cruzados con catálogo</div>
              {f.items?.map((it,j)=>{
                const cat=it.producto_jsx&&CATALOG[it.producto_jsx];
                return(<div key={j} style={{display:"grid",gridTemplateColumns:"1fr 52px 78px 78px",gap:6,padding:"4px 0",fontSize:11,color:C.muted,borderTop:j>0?`1px solid ${C.bdr}30`:"none"}}>
                  <span>{it.observaciones}{cat?<span style={{color:C.cyan,marginLeft:5}}>→ {it.producto_jsx}</span>:<span style={{color:C.muted,marginLeft:5,fontStyle:"italic"}}>(sin cruce)</span>}</span>
                  <span style={{textAlign:"right"}}>{it.cant} u</span>
                  <span style={{textAlign:"right"}}>{fmtF(it.vr_und)}/u</span>
                  <span style={{textAlign:"right",color:C.text,fontWeight:600}}>{fmtF(it.vr_total)}</span>
                </div>);
              })}
            </div>);
          })}
        </Card>
      ))}
    </>}
  </div>);
}

