const axios = require('axios');
const cheerio = require('cheerio');

export const handler = async (event, context) => {
  // Enable CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const { code_insee } = JSON.parse(event.body);

    let insee = String(code_insee);


    //if the code insee is only 4 digits, add a leading zero
    if (insee.length === 4) {
      insee = `0${code_insee}`;
    }

    const url = `https://www.insee.fr/fr/statistiques/2011101?geo=COM-${insee}`;

    console.log('Fetching INSEE data from:', url);


    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    });

    const $ = cheerio.load(html);
    const tablesByName = {};

    $('table').each((index, table) => {
      let tableName = $(table).find('caption').text().trim();
      if (!tableName) {
        tableName = $(table).prev('h3').text().trim();
      }
      if (!tableName) {
        tableName = `Tableau ${index + 1}`;
      }

      const tableData = [];
      $(table)
        .find('tr')
        .each((rowIndex, row) => {
          const rowData = [];
          $(row)
            .find('th, td')
            .each((colIndex, cell) => {
              rowData.push($(cell).text().trim());
            });
          if (rowData.length > 0) {
            tableData.push(rowData);
          }
        });

      if (tableData.length > 0) {
        tablesByName[tableName] = tableData;
      }
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tablesByName)
    };

  } catch (error) {
    console.error('INSEE function error:', error.message);
    return {
      statusCode: error.response?.status || 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: error.message || 'Internal Server Error'
      })
    };
  }
};
