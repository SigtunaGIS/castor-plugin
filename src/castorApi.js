async function castorImport(oauth2) {
  const response = await fetch('http://localhost:3002/api/mock/GetCastorSelection', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${oauth2.getUser().access_token}`
    }
  });
  if (response.ok) {
    return await response.json();
  }
}

async function castorExport(oauth2, data) {
  const response = await fetch('http://localhost:3002/api/mock/TransferSelectionToCastor', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${oauth2.getUser().access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (response.ok) {
    return;
  }
}

const CastorApi = {
  import: castorImport,
  export: castorExport
};

export default CastorApi;
