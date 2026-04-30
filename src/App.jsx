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
  }
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

const Card=({children,style,accent,floating})=><div style={{background:C.card,borderRadius:20,border:`1px solid ${C.bdr}`,padding:20,marginBottom:16,boxShadow:floating!==false?"0 10px 30px rgba(0,0,0,0.5)":"none",...(accent?{borderLeft:`3px solid ${accent}`}:{}),...style}}>{children}</div>;
const Sec=({children,color})=><div style={{fontSize:13,color:color||C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:14,fontWeight:700}}>{children}</div>;

export default function App(){
  const [cuadres,setCuadres]=useState([]);
  const [inventarios,setInventarios]=useState([]);
  const [cocinaData,setCocinaData]=useState([]);
  const [gastosData,setGastosData]=useState([]);
  const [gastosTransfData,setGastosTransfData]=useState([]);
  const [view,setView]=useState("dashboard");
  const [selDate,setSelDate]=useState("2026-04-28");
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

  const tabs=[{id:"dashboard",l:"Dashboard",i:"📊"},{id:"invdash",l:"Inv. Control",i:"🔄"},{id:"resumen",l:"Día",i:"◉"},{id:"cocina",l:"Cocina",i:"🍕"},{id:"inventario",l:"Inventario",i:"📦"},{id:"gastos",l:"Gastos",i:"📋"}];

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
              <p style={{fontSize:12,color:C.dim,margin:"2px 0 0",letterSpacing:2,textTransform:"uppercase",fontWeight:500}}>Control de ventas · Abril 2026</p>
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

      {view!=="dashboard"&&view!=="invdash"&&<div style={{maxWidth:920,margin:"0 auto",padding:"10px 16px",display:"flex",gap:6,overflowX:"auto",alignItems:"center"}}>
        <span style={{fontSize:14,color:C.dim,letterSpacing:1,textTransform:"uppercase",whiteSpace:"nowrap"}}>Día:</span>
        {dates.map(d=><button key={d} onClick={()=>setSelDate(d)} style={{
          background:selDate===d?C.goldDim+"50":"transparent",color:selDate===d?C.gold:C.muted,
          border:`1px solid ${selDate===d?C.goldDim:"transparent"}`,borderRadius:6,padding:"6px 12px",
          cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:"inherit",whiteSpace:"nowrap"
        }}>{fmtD(d)}</button>)}
      </div>}

      <div style={{maxWidth:920,margin:"0 auto",padding:"0 16px 60px"}}>
        {view==="dashboard"&&<DashboardGeneral cuadres={cuadres} cocina={cocinaData} gastos={gastosData} gastosTransf={gastosTransfData} inventarios={inventarios}/>}
        {view==="invdash"&&<InventarioDashboard inventarios={inventarios} cuadres={cuadres}/>}
        {view==="resumen"&&<Resumen c={c} coc={coc} gas={gas} cross={invCross} date={selDate}/>}
        {view==="cocina"&&<Cocina coc={coc} date={selDate}/>}
        {view==="inventario"&&<Inventario cross={invCross} prevFin={prevFin} fin={fin} date={selDate}/>}
        {view==="gastos"&&<Gastos gas={gas} date={selDate}/>}
      </div>
    </div>
  );
}

// ─── Dashboard General (Consolidado + Meta) ───
function DashboardGeneral({cuadres,cocina,gastos,gastosTransf,inventarios}){
  const META=40000000;
  const DIAS_MES=30;

  if(cuadres.length===0) return <div style={{textAlign:"center",padding:60,color:C.dim}}><div style={{fontSize:52,marginBottom:14}}>📊</div><p style={{fontSize:20,fontWeight:600}}>Sin datos aún</p><p style={{fontSize:14}}>Envía las fotos del POS a Claude para registrar</p></div>;

  const tot=cuadres.reduce((a,c)=>{
    a.venta+=c.venta_total;a.estanco+=c.estanco||0;a.cocteles+=c.cocteles||0;
    a.pizza+=c.pizzeria||0;a.efectivo+=c.efectivo;a.tarjeta+=c.tarjeta;
    a.otros+=(c.otros_pago||0);a.p80+=c.pizza_80;a.gastos+=c.gastos;
    a.nomina+=c.nomina;a.cf+=(c.costo_financiero||0);a.neto+=c.neto_sala||0;
    return a;
  },{venta:0,estanco:0,cocteles:0,pizza:0,efectivo:0,tarjeta:0,otros:0,p80:0,gastos:0,nomina:0,cf:0,neto:0});

  const totalGastos=tot.p80+tot.gastos+tot.nomina+tot.cf;
  const totalTransf=(gastosTransf||[]).reduce((a,g)=>a+(g.valor||0),0);
  const netoReal=tot.neto-totalTransf;
  const totalGastosReal=totalGastos+totalTransf;
  const avgDay=tot.venta/cuadres.length;
  const proyeccion=avgDay*DIAS_MES;
  const pctMeta=tot.venta/META;
  const diasRestantes=DIAS_MES-cuadres.length;
  const faltaMeta=META-tot.venta;
  const necesitaDia=diasRestantes>0?faltaMeta/diasRestantes:0;
  const barPct=tot.venta?(tot.estanco+tot.cocteles)/tot.venta:0;
  const margenPct=tot.venta?(tot.neto/tot.venta):0;
  const margenRealPct=tot.venta?(netoReal/tot.venta):0;

  const best=cuadres.reduce((a,b)=>a.venta_total>b.venta_total?a:b);
  const worst=cuadres.reduce((a,b)=>a.venta_total<b.venta_total?a:b);

  const chartData=cuadres.map(c=>{
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
  const acumData=cuadres.map((c,i)=>{
    acum+=c.venta_total;
    return{d:fmtD(c.date).split(" ").slice(0,2).join(" "),real:acum,meta:META/DIAS_MES*(i+1)};
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
    const de=cuadres.filter(c=>new Date(c.date+"T12:00:00").getDay()===dow);
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
          <div style={{fontSize:12,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>Meta abril</div>
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

    {/* ═══ KPIs ═══ */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:14}}>
      {[
        {l:"Venta acumulada",v:fmtF(tot.venta),s:`${cuadres.length} días`,c:C.gold},
        {l:"Promedio diario",v:fmtF(avgDay),s:`meta: ${fmtF(META/DIAS_MES)}/día`,c:avgDay>=META/DIAS_MES?C.green:"#fbbf24"},
        {l:"Estanco",v:fmtF(tot.estanco),s:pct(tot.estanco,tot.venta),c:C.gold},
        {l:"Cocteles",v:fmtF(tot.cocteles),s:pct(tot.cocteles,tot.venta),c:C.cyan},
        {l:"Pizzería",v:fmtF(tot.pizza),s:pct(tot.pizza,tot.venta),c:C.orange},
        {l:"Neto cuadres POS",v:fmtF(tot.neto),s:`margen ${(margenPct*100).toFixed(1)}%`,c:tot.neto>=0?C.green:C.red},
        {l:"Gastos transferencia",v:fmtF(totalTransf),s:`${(gastosTransf||[]).length} pagos`,c:C.purple},
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
    {gastosTransf&&gastosTransf.length>0&&(()=>{
      const semanas=[...new Set(gastosTransf.map(g=>g.periodo))].sort();
      const semanaData=semanas.map(p=>{
        const items=gastosTransf.filter(g=>g.periodo===p);
        return{periodo:p,total:items.reduce((a,g)=>a+g.valor,0),items};
      });
      const catTotals={};
      gastosTransf.forEach(g=>{catTotals[g.categoria]=(catTotals[g.categoria]||0)+g.valor;});
      const catList=Object.entries(catTotals).map(([k,v],i)=>({name:k,value:v,fill:PIE[i%PIE.length]})).sort((a,b)=>b.value-a.value);
      return(<>
        <Card accent={C.purple}>
          <Sec color={C.purple}>💸 Gastos por transferencia (no en cuadre POS)</Sec>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <div style={{background:C.bg,borderRadius:10,padding:"10px 12px",borderLeft:`3px solid ${C.purple}`}}>
              <div style={{fontSize:12,color:C.dim,textTransform:"uppercase",letterSpacing:.8}}>Total transferencias</div>
              <div style={{fontSize:24,fontWeight:700,color:C.purple,fontFamily:"'Poppins',sans-serif",marginTop:4}}>{fmtF(totalTransf)}</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{gastosTransf.length} pagos en {semanas.length} semanas</div>
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
            {[...gastosTransf].filter(g=>g.valor>0).sort((a,b)=>b.valor-a.valor).slice(0,5).map((g,i)=>(
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
    {cuadres.length>=5&&(()=>{
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
      cuadres.forEach(c=>{
        const wk=weekKey(c.date);
        if(!weekMap[wk]) weekMap[wk]={};
        const dow=new Date(c.date+"T12:00:00").getDay();
        weekMap[wk][dow]=c;
      });
      const sortedWeeks=Object.keys(weekMap).sort();
      const allValues=cuadres.map(c=>c.venta_total).filter(v=>v>0);
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
    {cuadres.length>=4&&(()=>{
      // Take last 14 days, split into "esta semana" (last 7) and "semana anterior" (previous 7)
      const sorted=[...cuadres].sort((a,b)=>a.date.localeCompare(b.date));
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
    {cuadres.length>=3&&<Card>
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
      {[...cuadres].reverse().map(c=>{
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
