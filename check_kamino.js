
const KAMINO_API = 'https://api.kamino.finance';
const MAIN_MARKET = '7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF';

async function checkKaminoData() {
    const url = `${KAMINO_API}/kamino-market/${MAIN_MARKET}/reserves/metrics`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        // Check for any key that might be liquidation threshold
        console.log(JSON.stringify(data[0], null, 2));
    } catch (e) {
        console.error(e);
    }
}

checkKaminoData();
