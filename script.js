document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('urlInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loading = document.getElementById('loading');
    const errorAlert = document.getElementById('errorAlert');
    const results = document.getElementById('results');
    const basicInfo = document.getElementById('basicInfo');
    const ogTags = document.getElementById('ogTags');
    const twitterTags = document.getElementById('twitterTags');
    const allMetaTags = document.getElementById('allMetaTags');

    analyzeBtn.addEventListener('click', analyzeMetaTags);
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            analyzeMetaTags();
        }
    });

   async function analyzeMetaTags() {
  const url = urlInput.value.trim();
  if (!url) {
    showError('Please enter a URL');
    return;
  }

  loading.classList.remove('d-none');
  errorAlert.classList.add('d-none');
  results.classList.add('d-none');

  try {
    // Use a free CORS proxy
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) throw new Error('Failed to fetch (CORS blocked)');

    const data = await response.json();
    
    if (data.contents) {
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(data.contents, 'text/html');
      displayMetaTags(htmlDoc);
      results.classList.remove('d-none');
    } else {
      throw new Error('No content received');
    }
  } catch (error) {
    showError(`Error: ${error.message}. Try a different URL.`);
  } finally {
    loading.classList.add('d-none');
  }
}
    
    function displayMetaTags(doc) {
        // Clear previous results
        basicInfo.innerHTML = '';
        ogTags.innerHTML = '';
        twitterTags.innerHTML = '';
        allMetaTags.innerHTML = '';
        
        // Get all meta tags
        const metaTags = doc.querySelectorAll('meta');
        
        // Basic info
        const title = doc.querySelector('title') ? doc.querySelector('title').textContent : 'Not found';
        const description = getMetaContent(metaTags, 'description');
        const keywords = getMetaContent(metaTags, 'keywords');
        const viewport = getMetaContent(metaTags, 'viewport');
        const charset = getMetaContent(metaTags, 'charset') || 
                        (doc.querySelector('meta[charset]') ? doc.querySelector('meta[charset]').getAttribute('charset') : 'Not found');
        
        addTableRow(basicInfo, 'Title', title);
        addTableRow(basicInfo, 'Description', description);
        addTableRow(basicInfo, 'Keywords', keywords);
        addTableRow(basicInfo, 'Viewport', viewport);
        addTableRow(basicInfo, 'Charset', charset);
        
        // Open Graph tags
        const ogTitle = getMetaContent(metaTags, 'og:title');
        const ogDescription = getMetaContent(metaTags, 'og:description');
        const ogUrl = getMetaContent(metaTags, 'og:url');
        const ogImage = getMetaContent(metaTags, 'og:image');
        const ogType = getMetaContent(metaTags, 'og:type');
        const ogSiteName = getMetaContent(metaTags, 'og:site_name');
        
        addTableRow(ogTags, 'og:title', ogTitle);
        addTableRow(ogTags, 'og:description', ogDescription);
        addTableRow(ogTags, 'og:url', ogUrl);
        addTableRow(ogTags, 'og:image', ogImage);
        addTableRow(ogTags, 'og:type', ogType);
        addTableRow(ogTags, 'og:site_name', ogSiteName);
        
        // Twitter Card tags
        const twitterCard = getMetaContent(metaTags, 'twitter:card');
        const twitterTitle = getMetaContent(metaTags, 'twitter:title');
        const twitterDescription = getMetaContent(metaTags, 'twitter:description');
        const twitterImage = getMetaContent(metaTags, 'twitter:image');
        const twitterSite = getMetaContent(metaTags, 'twitter:site');
        const twitterCreator = getMetaContent(metaTags, 'twitter:creator');
        
        addTableRow(twitterTags, 'twitter:card', twitterCard);
        addTableRow(twitterTags, 'twitter:title', twitterTitle);
        addTableRow(twitterTags, 'twitter:description', twitterDescription);
        addTableRow(twitterTags, 'twitter:image', twitterImage);
        addTableRow(twitterTags, 'twitter:site', twitterSite);
        addTableRow(twitterTags, 'twitter:creator', twitterCreator);
        
        // All meta tags
        metaTags.forEach(tag => {
            const name = tag.getAttribute('name') || tag.getAttribute('property') || tag.getAttribute('itemprop') || 'No name/property';
            const content = tag.getAttribute('content') || tag.getAttribute('value') || 'No content';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="font-monospace">${name}</td>
                <td>${content}</td>
            `;
            allMetaTags.appendChild(row);
        });
    }
    
    function getMetaContent(metaTags, name) {
        for (let i = 0; i < metaTags.length; i++) {
            const tag = metaTags[i];
            if (
                (tag.getAttribute('name') && tag.getAttribute('name').toLowerCase() === name.toLowerCase()) ||
                (tag.getAttribute('property') && tag.getAttribute('property').toLowerCase() === name.toLowerCase())
            ) {
                return tag.getAttribute('content') || 'No content';
            }
        }
        return 'Not found';
    }
    
    function addTableRow(table, name, value) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <th scope="row" class="w-25">${name}</th>
            <td>${value || 'Not found'}</td>
        `;
        table.appendChild(row);
    }
    
    function showError(message) {
        errorAlert.textContent = message;
        errorAlert.classList.remove('d-none');
        loading.classList.add('d-none');
        results.classList.add('d-none');
    }
    
    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }
});