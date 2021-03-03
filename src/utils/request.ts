import fetch from 'node-fetch';

export async function getRequest(url: string, host: string, params?: Record<string, any>) {
  const res = await fetch(url + '?' + new URLSearchParams(params).toString(), {
    method: 'GET',
    headers: {
      'x-rapidapi-key': process.env.API_KEY!,
      'x-rapidapi-host': host,
    },
  });

  if (res.status !== 200 || !res.ok) {
    return;
  } else {
    return res.json();
  }
}
