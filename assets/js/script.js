const btnBuscar = document.getElementById('btnBuscar');
const inputMonto = document.getElementById('montoClp');
const selectMoneda = document.getElementById('monedaSelect');
const resultadoTexto = document.getElementById('resultado');
const errorMensaje = document.getElementById('errorMensaje');
let myChart = null;

btnBuscar.addEventListener('click', async () => {
    const monto = inputMonto.value;
    const moneda = selectMoneda.value;

    errorMensaje.textContent = "";

    if (!monto || !moneda) {
        errorMensaje.textContent = "Por favor, ingresa un monto y selecciona una moneda.";
        return;
    }

    try {
        const response = await fetch(`https://mindicador.cl/api/${moneda}`);
        if (!response.ok) throw new Error("Error al consultar la API");
        
        const data = await response.json();

        const valorActual = data.serie[0].valor;
        const calculo = (monto / valorActual).toFixed(2);
        resultadoTexto.textContent = `Resultado: $${calculo}`;

        const ultimos10Dias = data.serie.slice(0, 10).reverse();
        
        const labels = ultimos10Dias.map(item => {
            const fecha = new Date(item.fecha);
            return fecha.toLocaleDateString('es-CL');
        });
        
        const valores = ultimos10Dias.map(item => item.valor);
        renderizarGrafico(labels, valores, moneda);

    } catch (error) {
        errorMensaje.textContent = `Ocurrió un error: ${error.message}. Intenta nuevamente.`;
        resultadoTexto.textContent = "Resultado: $0";
    }
});

function renderizarGrafico(labels, data, moneda) {
    const ctx = document.getElementById('miGrafico').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Historial últimos 10 días (${moneda})`,
                data: data,
                borderColor: 'red',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}