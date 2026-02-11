async function loadComponents() {
  // Load header
  const headerResponse = await fetch('/header.html');
  const headerHTML = await headerResponse.text();
  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  const footerResponse = await fetch('/footer.html');
  const footerHTML = await footerResponse.text();
  document.body.insertAdjacentHTML('beforeend', footerHTML);
}

loadComponents();