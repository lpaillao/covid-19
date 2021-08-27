const fetchData = async (url) => {
  const res = await fetch(url);

  return await res.json();
}

const refreshChartData = (chart, data, pageSize, pageNumber) => {
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

const loadChart = (data) => {
  const labels = data.slice(0, 15).map((item) => item.location);
  const confirmed = data.slice(0, 15).map((item) => item.confirmed);
  const deaths  = data.slice(0, 15).map((item) => item.deaths);

  var ctx = document.getElementById('myChart');
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

const App = async () => {
  const { data } = await fetchData('http://localhost:3000/api/total');
  const filtered = data.filter((item) => item.confirmed > 10000);

  const chart = loadChart(filtered);

  document.querySelector('#nextButton').addEventListener('click', () => {
    const currentPage = parseInt(document.querySelector('#currentPage').value);
    const labels = refreshChartData(chart, filtered, 15, currentPage+1);
    if (labels.length > 0) {
      document.querySelector('#currentPage').value = currentPage+1;
    }
  });

  document.querySelector('#prevButton').addEventListener('click', () => {
    const pageNumberEl = document.querySelector('#currentPage');
    const currentPage = parseInt(pageNumberEl.value);
    if (currentPage > 1) {
      refreshChartData(chart, filtered, 15, currentPage-1);
      pageNumberEl.value = currentPage-1;
    }
  });
}

App();
