const SECCIONES = [
    {
        titulo: "Aislamiento de contacto",
        items: [
            { n: 1, texto: "Se encuentra señalización en la puerta de la habitación del tipo de aislamiento" },
            { n: 2, texto: "El paciente se encuentra en habitación unipersonal, habitación compartida en pacientes con el mismo germen a 2 metros de distancia." },
            { n: 3, texto: "Higiene de manos de familiares." },
            { n: 4, texto: "usa los EPP (bata,mascarilla,guantes)" },
            { n: 5, texto: "Todo el material necesario para vestirse debe estar preparado dentro de la habitación. Se dispondrá de un area con el material necesario para llevar a cabo correctamente las medidas de precaución (mascarilla, guantes, batas, desechables y solución alcohólica)" },
            { n: 6, texto: "Alerta de aislamiento en la historia clínica y/o Kardex digital" },
            { n: 7, texto: "Se cumple con visitas restringidas" },
            { n: 8, texto: "Los familiares usan los EPP" },
            { n: 9, texto: "Elementos exclusivos para la atención: tensiómetro, fonendoscopio, termómetro" },
            { n: 10, texto: "paciente debe permanecer en la habitación y evitar salidas innecesarias" }
        ]
    }
]

if (typeof module !== "undefined") {
    module.exports = SECCIONES;
}