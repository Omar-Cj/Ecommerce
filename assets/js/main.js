  // Mapping category titles to Font Awesome icons
  const iconMapping = {
    Electronics: "fa-desktop",
    Grocery: "fa-shopping-cart",
    Beauty: "fa-heart",
    Cleaning: "fa-bath",
    Stationary: "fa-pencil",
    Pets: "fa-paw",
    Baking: "fa-birthday-cake",
    Spices: "fa-leaf",
    Toys: "fa-child",
    Magazines: "fa-newspaper-o",
  };

  // Fetch categories from the backend API and populate the menu
  fetch("https://suuqcasri-prod-b2dbb1ea4f1e.herokuapp.com/store/collections/")
    .then((response) => response.json())
    .then((data) => {
      const categoriesList = document.getElementById("categories-list");
      data.results.forEach((category) => {
        const li = document.createElement("li");
        li.innerHTML =
          '<a href="#">' +
          '<i class="fa ' +
          (iconMapping[category.title] || "fa-folder") +
          '"></i> ' +
          category.title +
          " (" +
          category.products_count +
          ")" +
          "</a>";
        categoriesList.appendChild(li);
      });
    })
    .catch((error) => {
      console.error("Error fetching categories:", error);
    });


 // Fetch and update the Fashion Products section while preserving the design
 fetch("https://suuqcasri-production-839407217d71.herokuapp.com/store/products/?collection_id=10")
 .then(response => response.json())
 .then(data => {
   const container = document.getElementById("fashion-products");
   // Clear any existing content (if any)
   container.innerHTML = "";
   data.results.forEach(product => {
     // Use the first available image or fallback to a placeholder
     const imageSrc =
       product.images && product.images.length > 0
         ? product.images[0].image
         : "assets/img/product-1.jpg";
     // Calculate discounted price if discount is provided
     const price = product.unit_price;
     const discountedPrice =
       product.discount && product.discount > 0
         ? (price - (price * product.discount) / 100).toFixed(2)
         : price.toFixed(2);
     // Build the product block using the existing design structure
     const productHTML = `
       <div class="col-4">
         <img src="${imageSrc}" alt="${product.title}" />
         <h4>${product.title}</h4>
         <div class="rating">
           <i class="fa fa-star"></i>
           <i class="fa fa-star"></i>
           <i class="fa fa-star"></i>
           <i class="fa fa-star"></i>
           <i class="fa fa-star-o"></i>
         </div>
         <p>$${discountedPrice}</p>
       </div>
     `;
     container.insertAdjacentHTML("beforeend", productHTML);
   });
 })
 .catch(error => {
   console.error("Error fetching fashion products:", error);
 });