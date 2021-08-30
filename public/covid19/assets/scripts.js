const fetchData = async (url) => {
  const res = await fetch(url);

  return await res.json();
}

const refreshBarChart = (chart, data) => {
  const labels = data.map((item) => item.location);
  const confirmed = data.map((item) => item.confirmed);
  const deaths  = data.map((item) => item.deaths);

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

const paginate = (arr, size) => {
  return arr.reduce((acc, val, i) => {
    let idx = Math.floor(i / size)
    let page = acc[idx] || (acc[idx] = [])
    page.push(val)

    return acc
  }, [])
}


const generateBarChart = (data) => {
  const labels = data.map((item) => item.location);
  const confirmed = data.map((item) => item.confirmed);
  const deaths  = data.map((item) => item.deaths);

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

  return data;
}

const prepareModalDetails = (pieChart) => {
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

const App = async () => {
  const { data } = await fetchData('http://localhost:3000/api/total');
  const filteredData = data.filter((item) => item.confirmed > 10000);

  const dataPaginated = paginate(filteredData, 15);
  const chart = generateBarChart(dataPaginated[0]);
  const pieChart = generatePieChart();
  generateTable(dataPaginated[0]);
  prepareModalDetails(pieChart);

  document.querySelector('#nextButton').addEventListener('click', () => {
    const pageNumberEl = document.querySelector('#currentPage');
    const currentPage = parseInt(pageNumberEl.value);
    if(dataPaginated[currentPage+1]?.length > 0) {
      refreshBarChart(chart, dataPaginated[currentPage+1]);
      pageNumberEl.value = currentPage+1;
    }
  });

  document.querySelector('#prevButton').addEventListener('click', () => {
    const pageNumberEl = document.querySelector('#currentPage');
    const currentPage = parseInt(pageNumberEl.value);
    if (currentPage-1 >= 0) {
      refreshBarChart(chart, dataPaginated[currentPage-1]);
      pageNumberEl.value = currentPage-1;
    }
  });

  document.querySelector('#nextTableButton').addEventListener('click', () => {
    const pageNumberEl = document.querySelector('#currentPageTable');
    const currentPage = parseInt(pageNumberEl.value);
    if (dataPaginated[currentPage+1]?.length > 0) {
      document.querySelector('#tableBody').innerHTML = '';
      generateTable(dataPaginated[currentPage+1]);
      pageNumberEl.value = currentPage+1;
      prepareModalDetails(pieChart);
    }
  });

  document.querySelector('#prevTableButton').addEventListener('click', () => {
    const pageNumberEl = document.querySelector('#currentPageTable');
    const currentPage = parseInt(pageNumberEl.value);
    if (currentPage-1 >= 0) {
      document.querySelector('#tableBody').innerHTML = '';
      generateTable(dataPaginated[currentPage-1]);
      pageNumberEl.value = currentPage-1;
      prepareModalDetails(pieChart);
    }
  });
}

App();

//MODAL LOGIN
document.querySelector('#btnLogin').addEventListener('click', () => {
  const modalLogin = new bootstrap.Modal(document.getElementById('modalLogin'));
  modalLogin.show();
});

//JWT
    const postData = async (email, password) => {
  try {
    const response = await fetch('http://localhost:3000/api/login',
  {
    method:'POST',
    body: JSON.stringify({email:email,password:password})
  })
    const {token} = await response.json()
    let resultado={'estado':'ok','token':token};
    return resultado
  } catch (err) {
    let resultado={'estado':'error','token':token};
    return resultado
    console.error(`Error: ${err}`)
  }
}
$('#formLogin').submit(async (event) => {
    event.preventDefault()
    const email = document.getElementById('correo').value
    const password = document.getElementById('pass').value
    const JWT = await postData(email,password)
    if(JWT.estado=='ok'){
      $('#sitChile').removeClass('visually-hidden');
      $('#liLogout').removeClass('visually-hidden');
      $('#liLogin').addClass('visually-hidden');
    }
    localStorage.setItem('jwt', JWT.token);
    console.log(JWT)
  })

