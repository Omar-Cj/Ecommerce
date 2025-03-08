// Function to get query parameters
function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  }
  
  const productId = getQueryParam("productId");
  if (productId) {
    fetch(`https://suuqcasri-production-839407217d71.herokuapp.com/store/products/${productId}/`)
      .then(response => response.json())
      .then(product => {
        // Update product title, price, and description dynamically
        document.getElementById("productTitle").innerText = product.title;
        
        const price = product.unit_price;
        const discountedPrice =
          product.discount && product.discount > 0
            ? (price - (price * product.discount) / 100).toFixed(2)
            : price.toFixed(2);
        document.getElementById("productPrice").innerText = `$${discountedPrice}`;
        document.getElementById("productDescription").innerText = product.description;
        
        // Update the main product image using the first image in the gallery
        if (product.images && product.images.length > 0) {
          document.getElementById("ProductImg").src = product.images[0].image;
        
          // Dynamically update gallery thumbnails
          const galleryRow = document.getElementById("galleryRow");
          galleryRow.innerHTML = "";
          product.images.forEach(img => {
            const thumb = document.createElement("div");
            thumb.className = "small-img-col";
            thumb.innerHTML = `<img src="${img.image}" class="small-img" />`;
            galleryRow.appendChild(thumb);
          });
        }
      })
      .catch(error => {
        console.error("Error fetching product details:", error);
      });
  } else {
    console.error("No productId found in URL");
  }
  