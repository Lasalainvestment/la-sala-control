import { useState, useEffect, useCallback, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

// ─── Pre-loaded data extracted from POS receipts (Miércoles 01 Abril 2026) ───
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
      {nombre:"TEQUILA ML",saldo:0},
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
      {nombre:"OLD PARR MEDIA",saldo:0}
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
  }
];

// ─── CATÁLOGO MAESTRO DE PRECIOS (referencia: inventario_la_sala_para_Claude.xlsx) ───
// Cada producto: { categoria, compra, venta, fuente, notas }
// compra=0 → producto sin facturación (verificar). venta=0 → insumo coctelería.
const CATALOG = {
  "AGT BOTLLA ANQUEÑ": {categoria:"Aguardiente",compra:47100,venta:90000,fuente:"Compra: GIR-FDJC9405-01may | Venta: CARTA",notas:"Antioqueño Trad Tapa Roja 750cc (Tapa Verde S/AZ $46.800 FDJC9356)"},
  "AGT BOTLLA CAUCA": {categoria:"Aguardiente",compra:42900,venta:90000,fuente:"Compra: GIR-FDJC9133-24abr | Venta: CARTA",notas:"Caucano Trad 750cc (confirmado factura)"},
  "AGT BOTLLA REAL": {categoria:"Aguardiente",compra:42900,venta:90000,fuente:"Compra: ESTIM | Venta: CARTA",notas:"Estim. similar a Caucano (no facturado)"},
  "AGT MEDIA ANQUEÑ": {categoria:"Aguardiente",compra:26500,venta:60000,fuente:"Compra: GIR-FDJC9405-01may | Venta: CARTA",notas:"Antioqueño S/AZ Tapa Azul 375cc CAN (real)"},
  "AGT MEDIA CAUCA": {categoria:"Aguardiente",compra:22800,venta:60000,fuente:"Compra: GIR-FDJC9356-30abr | Venta: CARTA",notas:"Caucano Trad CAN 375cc (confirmado factura)"},
  "AGUA": {categoria:"Bebidas no alcohólicas",compra:1300,venta:6000,fuente:"Compra: GIR-18abr | Venta: CARTA",notas:"Cristal 600cc"},
  "AGUA TONICA": {categoria:"Bebidas no alcohólicas",compra:2300,venta:6000,fuente:"Compra: GIR-FDJC9133-24abr | Venta: CARTA",notas:"Schweppes Tónica NR 300cc (confirmado factura)"},
  "AMARETTO": {categoria:"Licores/Cócteles",compra:49900,venta:0,fuente:"Compra: GIR-PD102560-17may | Venta: INSUMO",notas:"Tres Plumas Amareto 700cc (precio real)"},
  "CACHAZA": {categoria:"Licores/Cócteles",compra:0,venta:0,fuente:"Compra: VERIFICAR | Venta: INSUMO",notas:"Insumo Caipirinha"},
  "CAJA DE VINO": {categoria:"Vino",compra:20650,venta:0,fuente:"Compra: GIR-FDJC9133-24abr | Venta: VERIFICAR",notas:"Vino Cata Tint T/Pack 1L (confirmado factura)"},
  "CERVEZA CORONA": {categoria:"Cerveza",compra:3800,venta:13000,fuente:"Compra: GIR-FDJC10005-15may | Venta: CARTA",notas:"Corona Bot 330cc (precio real)"},
  "CERVEZA IMPORTADA": {categoria:"Cerveza",compra:3563,venta:13000,fuente:"Compra: VERIFICAR | Venta: CARTA",notas:"No facturada en periodo"},
  "CERVEZA NACIONAL": {categoria:"Cerveza",compra:3400,venta:9000,fuente:"Compra: GIR-FDJC10005-15may | Venta: CARTA",notas:"Promedio Club C.Dorada $3.500 / Poker $3.300"},
  "CHICLETS": {categoria:"Otros",compra:6000,venta:0,fuente:"Compra: VERIFICAR | Venta: VERIFICAR",notas:""},
  "CIGARRILLOS": {categoria:"Otros",compra:0,venta:0,fuente:"Compra: VERIFICAR | Venta: VERIFICAR",notas:""},
  "CREMA DE WHISKY": {categoria:"Licores/Cócteles",compra:27100,venta:0,fuente:"Compra: GIR-FDJC10282-22may | Venta: INSUMO",notas:"Crema/Wh Jumbo 750cc (precio real confirmado factura)"},
  "CURAZAO AZUL": {categoria:"Licores/Cócteles",compra:25000,venta:0,fuente:"Compra: VERIFICAR | Venta: INSUMO",notas:"Insumo cóctel Blue Hawai/Burbujas Azules"},
  "DRY MARTINY": {categoria:"Licores/Cócteles",compra:67300,venta:0,fuente:"Compra: GIR-PD102560-17may | Venta: INSUMO",notas:"Martini Extra Dry 750cc (precio real)"},
  "ELECTROLIT": {categoria:"Bebidas no alcohólicas",compra:7200,venta:15000,fuente:"Compra: GIR-04abr | Venta: VERIFICAR",notas:"Suero Electrolit 625cc"},
  "ENCENDEDOR": {categoria:"Otros",compra:0,venta:0,fuente:"Compra: VERIFICAR | Venta: VERIFICAR",notas:""},
  "GASEOSA": {categoria:"Bebidas no alcohólicas",compra:2400,venta:6000,fuente:"Compra: GIR-FDJC9133-24abr | Venta: CARTA",notas:"Postobón NR Soda 10oz (confirmado factura)"},
  "GASEOSA 1.5": {categoria:"Bebidas no alcohólicas",compra:4900,venta:10000,fuente:"Compra: GIR-24abr | Venta: CARTA",notas:"Aprox. Jugo del Valle Citrus 1.5L"},
  "GINEBRA BOTELLA": {categoria:"Ginebra",compra:150000,venta:280000,fuente:"Compra: GIR-02abr | Venta: CARTA",notas:"Perigans 700cc (Tanqueray/Bombay $280k según marca)"},
  "GINEBRA DL": {categoria:"Ginebra",compra:20000,venta:20000,fuente:"Compra: INSUMO | Venta: CARTA",notas:"Trago doble - precio carta (Aguard/Ron)"},
  "GINEBRA ML": {categoria:"Ginebra",compra:77000,venta:0,fuente:"Compra: INSUMO | Venta: INSUMO",notas:"Insumo cóctel"},
  "LICOR CAFÉ": {categoria:"Licores/Cócteles",compra:49900,venta:0,fuente:"Compra: GIR-FDJC9133-24abr | Venta: INSUMO",notas:"Tres Plumas Café 700cc - insumo (confirmado)"},
  "LICOR DE MANZANA": {categoria:"Licores/Cócteles",compra:25000,venta:0,fuente:"Compra: VERIFICAR | Venta: INSUMO",notas:"Insumo Apple Martini"},
  "LICOR DE MENTA": {categoria:"Licores/Cócteles",compra:74400,venta:0,fuente:"Compra: GIR-FDJC9133-24abr | Venta: INSUMO",notas:"Convier Menta 750cc - insumo Demonio Verde (confirmado)"},
  "RED BULL": {categoria:"Bebidas no alcohólicas",compra:6400,venta:15000,fuente:"Compra: VERIFICAR | Venta: CARTA",notas:"No facturado (Amper $2.900 NO es Red Bull)"},
  "RON CALDAS BOTELLA": {categoria:"Ron",compra:59300,venta:110000,fuente:"Compra: GIR-FDJC9356-30abr | Venta: CARTA",notas:"Ron V.de Caldas 750cc (precio real confirmado)"},
  "RON CALDAS MEDIA": {categoria:"Ron",compra:30700,venta:80000,fuente:"Compra: GIR-FDJC9420-01may | Venta: CARTA",notas:"Ron V.de Caldas CAN 375cc (precio real confirmado)"},
  "RON DL": {categoria:"Ron",compra:20000,venta:20000,fuente:"Compra: INSUMO | Venta: CARTA",notas:"Trago doble Ron"},
  "TEQUILA BOTELLA": {categoria:"Tequila",compra:77800,venta:195000,fuente:"Compra: GIR-FDJC10282-22may | Venta: CARTA",notas:"José Cuervo Amar 750cc $77.800 (var: Jimador $101.000, Olmeca $76.100 - mismo grupo)"},
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
  "WHISKEY COCTELERIA": {categoria:"Whisky",compra:51600,venta:0,fuente:"Compra: GIR-FDJC9133-24abr | Venta: INSUMO",notas:"Passport Scot 700cc - insumo cócteles (confirmado)"},
  "BALLANTINES COCTELERIA": {categoria:"Whisky",compra:83500,venta:0,fuente:"Compra: GIR-FDJC8447-02abr | Venta: INSUMO",notas:"Ballantine's Finest 1L - insumo coctelería"},
  "SOMETHING SPECIAL COCT": {categoria:"Whisky",compra:59900,venta:0,fuente:"Compra: GIR-FDJC10005-15may | Venta: INSUMO",notas:"Something Special 750cc - insumo coctelería (var. $58.800 FDJC9420)"},
  "HIELO": {categoria:"Otros",compra:4600,venta:0,fuente:"Compra: GIR-FDJC9133-24abr | Venta: INSUMO",notas:"Hielo Kolbitos 3KG - insumo coctelería"},
  "CREMA DE LECHE": {categoria:"Otros",compra:19500,venta:0,fuente:"Compra: REY-10864-19may | Venta: INSUMO",notas:"El Rey - insumo coctelería"},
  "PAQUETE DE MENTAS": {categoria:"Otros",compra:30000,venta:0,fuente:"Compra: REY-10864-19may | Venta: INSUMO",notas:"El Rey - insumo coctelería"},
  "GOTAS AMARGAS": {categoria:"Licores/Cócteles",compra:8000,venta:0,fuente:"Compra: REY-10864-19may | Venta: INSUMO",notas:"El Rey - bitter coctelería (tipo Angostura)"},
  "VODKA TAMARINDO": {categoria:"Vodka",compra:45400,venta:0,fuente:"Compra: GIR-PD102247-14may | Venta: INSUMO",notas:"Smirnoff Tamarindo Picante 750cc - insumo coctelería"},
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
  // FDJC9133 · 2026-04-24 · vence 2026-05-24 · A Pagar $485.500
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
  // FDJC9356 · 2026-04-30 · vence 2026-05-30 · A Pagar $522.100
  { fecha:"2026-04-30", factura:"FDJC9356", proveedor:"GIR (Licores Junior)", vence:"2026-05-30", a_pagar:522100, items:[
    { producto_jsx:"GASEOSA 1.5", cant:12, base_und:4495.8, icl_und:0, vr_und:5350, vr_total:64200, observaciones:"GASEO COC/COLA NR 1.5LIT (Coca-Cola 1.5L $5.350)" },
    { producto_jsx:"AGT BOTLLA ANQUEÑ", cant:4, base_und:29327.62, icl_und:16006, vr_und:46800, vr_total:187200, observaciones:"AGUARD ANTIOQUENO S/AZ 24° TAPA VERDE 750CC" },
    { producto_jsx:"AGT MEDIA CAUCA", cant:3, base_und:13725.71, icl_und:8388, vr_und:22800, vr_total:68400, observaciones:"AGUARD CAUCANO TRAD CAN 375CC" },
    { producto_jsx:"RON CALDAS BOTELLA", cant:2, base_und:35487.62, icl_und:22038, vr_und:59300, vr_total:118600, observaciones:"RON V.DE CALDAS BOT 750CC" },
    { producto_jsx:"TEQUILA BOTELLA", cant:1, base_und:42722.07, icl_und:29041.83, vr_und:73900, vr_total:73900, observaciones:"TEQUILA JOSE CUERVO AMAR BOT 750CC" },
    { producto_jsx:"GASEOSA 1.5", cant:2, base_und:4117.65, icl_und:0, vr_und:4900, vr_total:9800, observaciones:"JUGO DEL VALLE CITRUS 1.5LIT" },
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
  // PD102247 · 2026-05-14 · Doc Pedido (ya recogido, "LA SALA YA LLEVO") · A Pagar $90.800
  { fecha:"2026-05-14", factura:"PD102247", proveedor:"GIR (Licores Junior)", vence:"2026-06-13", a_pagar:90800, items:[
    { producto_jsx:"VODKA TAMARINDO", cant:2, base_und:27175, icl_und:18225, vr_und:45400, vr_total:90800, observaciones:"VODKA SMIRNOFF TAMARINDO PICANTE 750CC (insumo coctelería)" },
  ]},
  // PD102560 · 2026-05-17 · Doc Pedido (nota "LA SALA") · A Pagar $284.550
  { fecha:"2026-05-17", factura:"PD102560", proveedor:"GIR (Licores Junior)", vence:"2026-06-16", a_pagar:284550, items:[
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
];

// ─── Cartera proveedor GIR (Giraldo's S.A.S.) — cuentas por pagar ───
// Base: estado de cuenta arcoerp al 02/05/2026 (Total Cartera $3.163.900) + FDJC10005 posterior.
// estado: "pendiente" | "cancelada". Juanma confirma cuáles ya canceladas al 18-05-2026.
// detalle:true = factura con imagen procesada en PRELOADED_COMPRAS.
const PRELOADED_CARTERA = [
  { proveedor:"GIR (Licores Junior)", factura:"FDJC008379", fecha:"2026-04-01", vence:"2026-05-01", valor:459800, detalle:false, estado:"cancelada", nota:"Vencida al corte 02/05 (estado de cuenta). Sin imagen detallada." },
  // FDJC008440 ($356.500) RETIRADA: no pertenece a La Sala (confirmado Juanma).
  { proveedor:"GIR (Licores Junior)", factura:"FDJC008445", fecha:"2026-04-02", vence:"2026-05-02", valor:296100, detalle:false, estado:"cancelada", nota:"Sin imagen detallada." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC8447", fecha:"2026-04-02", vence:"2026-05-02", valor:167000, detalle:true, estado:"cancelada", nota:"Detalle cargado (Ballantine's Finest x2). Nota factura: ya llevo." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC008491", fecha:"2026-04-04", vence:"2026-05-04", valor:84800, detalle:false, estado:"cancelada", nota:"Sin imagen detallada." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC008961", fecha:"2026-04-18", vence:"2026-05-18", valor:340900, detalle:false, estado:"cancelada", nota:"Sin imagen detallada." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC9133", fecha:"2026-04-24", vence:"2026-05-24", valor:485500, detalle:true, estado:"pendiente", nota:"Detalle cargado (9 ítems)." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC9356", fecha:"2026-04-30", vence:"2026-05-30", valor:522100, detalle:true, estado:"pendiente", nota:"Detalle cargado (6 ítems)." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC9405", fecha:"2026-05-01", vence:"2026-05-31", valor:194300, detalle:true, estado:"pendiente", nota:"Detalle cargado (2 ítems). Nota factura: La Sala ya llevo." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC9420", fecha:"2026-05-01", vence:"2026-05-31", valor:256900, detalle:true, estado:"pendiente", nota:"Detalle cargado (3 ítems)." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC10005", fecha:"2026-05-15", vence:"2026-06-14", valor:319000, detalle:true, estado:"pendiente", nota:"Posterior al corte del estado de cuenta (02/05). Detalle cargado (7 ítems)." },
  { proveedor:"GIR (Licores Junior)", factura:"PD102247", fecha:"2026-05-14", vence:"2026-06-13", valor:90800, detalle:true, estado:"pendiente", nota:"Doc Pedido a crédito (30 días). Detalle cargado (Vodka Smirnoff Tamarindo x2). Nota factura: La Sala ya llevo." },
  { proveedor:"GIR (Licores Junior)", factura:"PD102560", fecha:"2026-05-17", vence:"2026-06-16", valor:284550, detalle:true, estado:"pendiente", nota:"Doc Pedido a crédito (30 días). Detalle cargado (6 ítems)." },
  { proveedor:"Distribuidora El Rey", factura:"REY-10864", fecha:"2026-05-19", vence:"2026-06-18", valor:155000, detalle:true, estado:"pendiente", nota:"Recibo 10864 (Reinaldo López, vendedor). Insumos coctelería: 6 Crema de Leche, 1 Paquete Mentas, 1 Gotas Amargas. Plazo asumido 30 días — confirmar." },
  { proveedor:"Coca-Cola", factura:"CC-00001", fecha:"2026-05-20", vence:"2026-05-20", valor:153800, detalle:true, estado:"cancelada", nota:"Soporte de Entrega 00001. 1 caja Coca-Cola 350ML + 1 caja Schweppes Tónica + 1 caja Coca-Cola Zero. Pagada vía transferencia 21 may." },
  { proveedor:"D1", factura:"H7Z1136639", fecha:"2026-05-21", vence:"2026-05-21", valor:58350, detalle:true, estado:"cancelada", nota:"Factura electrónica D1. Insumos y licor (Jugo del Valle, Whisky Escocés, Gomas). Pagada en contado tarjeta." },
  { proveedor:"Proveedor Frutas", factura:"FRUTA-21may", fecha:"2026-05-21", vence:"2026-05-21", valor:153000, detalle:true, estado:"cancelada", nota:"Cuenta de cobro frutas/hierbas + domicilio. Pagada vía transferencia 21 may." },
  { proveedor:"GIR (Licores Junior)", factura:"FDJC10282", fecha:"2026-05-22", vence:"2026-06-21", valor:685100, detalle:true, estado:"pendiente", nota:"Crédito 30 días. Detalle: Crema Whisky Jumbo, Old Parr, Ron Caldas (Bot+Can), 4 Tequilas botella (Cuervo+Jimador+2 Olmeca), 24 Poker." },
  { proveedor:"GIR (Licores Junior)", factura:"JR-CONTADO-22may", fecha:"2026-05-22", vence:"2026-05-22", valor:663000, detalle:false, estado:"cancelada", nota:"Compra de contado. Pagada el mismo día (probablemente 6 tequilas botella adicionales — sin detalle de productos)." },
  { proveedor:"Bavaria", factura:"BAV-PICKING-01may", fecha:"2026-05-01", vence:"2026-05-01", valor:480400, detalle:true, estado:"cancelada", nota:"Lista Picking 01-may. Relacionada y cancelada vía transferencia ($480.400, 1 may)." },
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
  const [selDate,setSelDate]=useState("2026-05-22");
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

  const tabs=[{id:"dashboard",l:"Dashboard",i:"📊"},{id:"resreal",l:"Resultado Real",i:"🧮"},{id:"invdash",l:"Inv. Control",i:"🔄"},{id:"invvalue",l:"Inv. Valorizado",i:"💰"},{id:"analcat",l:"Por Categoría",i:"📈"},{id:"compras",l:"Compras",i:"🧾"},{id:"resumen",l:"Día",i:"◉"},{id:"cocina",l:"Cocina",i:"🍕"},{id:"inventario",l:"Inventario",i:"📦"},{id:"gastos",l:"Gastos",i:"📋"}];

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
        {view==="dashboard"&&<DashboardGeneral cuadres={cuadres} cocina={cocinaData} gastos={gastosData} gastosTransf={gastosTransfData} inventarios={inventarios}/>}
        {view==="resreal"&&<ResultadoReal cuadres={cuadres} gastos={gastosData} gastosTransf={gastosTransfData}/>}
        {view==="invdash"&&<InventarioDashboard inventarios={inventarios} cuadres={cuadres}/>}
        {view==="invvalue"&&<InventarioValorizado inventarios={inventarios}/>}
        {view==="analcat"&&<AnalisisCategoria inventarios={inventarios} cocina={cocinaData}/>}
        {view==="compras"&&<ComprasModule compras={PRELOADED_COMPRAS} cartera={PRELOADED_CARTERA}/>}
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

function DashboardGeneral({cuadres,cocina,gastos,gastosTransf,inventarios}){
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
function ComprasModule({compras,cartera}){
  const HOY="2026-05-23";
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
          <div><Sec color={C.gold}>💳 Cuentas por pagar · GIR (Giraldo's S.A.S.)</Sec>
            <div style={{fontSize:12,color:C.dim}}>Base: estado de cuenta al 02/05/2026 + facturas posteriores</div></div>
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
          Todas marcadas <b>pendiente</b> por defecto. Juanma: confirma cuáles ya están canceladas al 18-05-2026 y las muevo a "cancelada" para que el saldo sea exacto.
        </div>
      </Card>

      <Card>
        <Sec>Detalle de cartera</Sec>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
            <thead><tr style={{color:C.gold,textAlign:"left",borderBottom:`2px solid ${C.gold}40`}}>
              <th style={{padding:"8px 6px"}}>Factura</th>
              <th style={{padding:"8px 6px"}}>Emisión</th>
              <th style={{padding:"8px 6px"}}>Vence</th>
              <th style={{padding:"8px 6px",textAlign:"right"}}>Valor</th>
              <th style={{padding:"8px 6px",textAlign:"center"}}>Días</th>
              <th style={{padding:"8px 6px",textAlign:"center"}}>Detalle</th>
              <th style={{padding:"8px 6px",textAlign:"center"}}>Estado</th>
            </tr></thead>
            <tbody>
              {cart.slice().sort((a,b)=>a.vence.localeCompare(b.vence)).map((c,i)=>{
                const d=dias(c.vence), venc=c.estado!=="cancelada"&&c.vence<HOY;
                return(<tr key={i} style={{borderBottom:`1px solid ${C.bdr}40`,background:venc?C.red+"0d":"transparent"}}>
                  <td style={{padding:"8px 6px",fontWeight:700,color:C.gold}}>{c.factura}</td>
                  <td style={{padding:"8px 6px",color:C.dim}}>{fmtD(c.fecha).replace(" 2026","")}</td>
                  <td style={{padding:"8px 6px",color:venc?C.red:C.text}}>{fmtD(c.vence).replace(" 2026","")}</td>
                  <td style={{padding:"8px 6px",textAlign:"right",fontWeight:600,color:C.text,fontVariantNumeric:"tabular-nums"}}>{fmtF(c.valor)}</td>
                  <td style={{padding:"8px 6px",textAlign:"center",color:c.estado==="cancelada"?C.muted:venc?C.red:d<=7?C.gold:C.muted,fontWeight:venc?700:500}}>{c.estado==="cancelada"?"—":venc?`${Math.abs(d)}d venc.`:`${d}d`}</td>
                  <td style={{padding:"8px 6px",textAlign:"center"}}>{c.detalle?<span style={{color:C.green}}>✓</span>:<span style={{color:C.muted}}>—</span>}</td>
                  <td style={{padding:"8px 6px",textAlign:"center"}}><span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:6,background:c.estado==="cancelada"?C.greenDim:venc?C.redDim:C.bdr,color:c.estado==="cancelada"?C.green:venc?C.red:C.dim}}>{c.estado==="cancelada"?"Cancelada":"Pendiente"}</span></td>
                </tr>);
              })}
              <tr style={{borderTop:`2px solid ${C.gold}`,fontWeight:800,color:C.gold,background:C.gold+"10"}}>
                <td style={{padding:"10px 6px"}} colSpan={3}>SALDO PENDIENTE ({pend.length} fact.)</td>
                <td style={{padding:"10px 6px",textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{fmtF(totalPend)}</td>
                <td colSpan={3}></td>
              </tr>
            </tbody>
          </table>
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

