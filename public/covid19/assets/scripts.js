const fetchData = async (url) => {
  const res = await fetch(url);

  return await res.json();
}

const refreshBarChartData = (chart, data, pageSize, pageNumber) => {
  const labels = data.slice((pageNumber - 1) * pageSize, pageNumber * pageSize).map((item) => item.location);
  const confirmed = data.slice((pageNumber - 1) * pageSize, pageNumber * pageSize).map((item) => item.confirmed);
  const deaths  = data.slice((pageNumber - 1) * pageSize, pageNumber * pageSize).map((item) => item.deaths);

  chart.data.labels = labels;
  chart.data.datasets = [
    {
      label: 'Casos Confirmados',
      data: confirmed,
      backgroundColor: 'red',
      borderColor: 'red',
      borderWidth: 1
    },
    {
      label: 'Casos Muertos',
      data: deaths,
      backgroundColor: 'gray',
      borderColor: 'gray',
      borderWidth: 1
    },
  ];

  labels.length > 0 && chart.update();

  return labels;
}

const generateBarChart = (data) => {
  const labels = data.slice(0, 15).map((item) => item.location);
  const confirmed = data.slice(0, 15).map((item) => item.confirmed);
  const deaths  = data.slice(0, 15).map((item) => item.deaths);

  const ctx = document.getElementById('myChart');
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Casos Confirmados',
          data: confirmed,
          backgroundColor: 'red',
          borderColor: 'red',
          borderWidth: 1
        },
        {
          label: 'Casos Muertos',
          data: deaths,
          backgroundColor: 'gray',
          borderColor: 'gray',
          borderWidth: 1
        },
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  return chart;
}

const generatePieChart = (confirmed = 0, deaths = 0) => {
  const ctx = document.getElementById('myChart2');
  const myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Confirmados', 'Muertos'],
      datasets: [
        {
          label: 'Dataset 1',
          data: [confirmed, deaths],
          backgroundColor: ['red', 'gray'],
        },
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Covid-19'
        }
      }
    },
  });

  return myChart;
}

const generateTable = (data) => {
  const tableEl = document.querySelector('#tableBody');
  data.forEach((item) => {
    const trEl = document.createElement('tr');
    const locationEl = document.createElement('td');
    const confirmedEl = document.createElement('td');
    const deathEl = document.createElement('td');
    const detailsEl = document.createElement('td');
    const detailsLinkEl = document.createElement('a');

    locationEl.textContent = item.location;
    confirmedEl.textContent = item.confirmed;
    deathEl.textContent = item.deaths;
    detailsLinkEl.href = '#'+item.location;
    detailsLinkEl.id = item.location;
    detailsLinkEl.classList.add('link')
    detailsLinkEl.textContent = 'Ver Detalles';

    detailsEl.appendChild(detailsLinkEl);

    trEl.appendChild(locationEl);
    trEl.appendChild(confirmedEl);
    trEl.appendChild(deathEl);
    trEl.appendChild(detailsEl);
    tableEl.appendChild(trEl);
  });

}

const App = async () => {
  const { data } = await fetchData('http://localhost:3000/api/total');
  const filteredData = data.filter((item) => item.confirmed > 10000);

  const chart = generateBarChart(filteredData);
  const table = generateTable(filteredData);
  const pieChart = generatePieChart();

  document.querySelector('#nextButton').addEventListener('click', () => {
    const currentPage = parseInt(document.querySelector('#currentPage').value);
    const labels = refreshChartData(chart, filteredData, 15, currentPage+1);
    if (labels.length > 0) {
      document.querySelector('#currentPage').value = currentPage+1;
    }
  });

  document.querySelector('#prevButton').addEventListener('click', () => {
    const pageNumberEl = document.querySelector('#currentPage');
    const currentPage = parseInt(pageNumberEl.value);
    if (currentPage > 1) {
      refreshChartData(chart, filteredData, 15, currentPage-1);
      pageNumberEl.value = currentPage-1;
    }
  });

  document.querySelectorAll('.link').forEach((el) => {
    el.addEventListener('click', async () => {
      const country = el.id;
      const { data } = await fetchData(`http://localhost:3000/api/countries/${country}`);
      document.querySelector('.modal-title').textContent = data.location;
      const myModal = new bootstrap.Modal(document.getElementById('myModal'));
      myModal.show();
      pieChart.data.datasets[0].data = [data.confirmed, data.deaths];
      pieChart.update();

    });
  })
}

App();
