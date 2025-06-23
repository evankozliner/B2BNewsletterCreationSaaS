  // Get UTM params from the current URL
  const urlParams = new URLSearchParams(window.location.search);
  const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

  const filteredParams = new URLSearchParams();
  utmParams.forEach(param => {
    if (urlParams.has(param)) {
      filteredParams.set(param, urlParams.get(param));
    }
  });

  // Append UTM params to all Typeform links
  if ([...filteredParams].length > 0) {
    document.querySelectorAll('a[href*="typeform.com"]').forEach(link => {
      const originalUrl = new URL(link.href);
      filteredParams.forEach((value, key) => {
        originalUrl.searchParams.set(key, value);
      });
      link.href = originalUrl.toString();
    });
  }