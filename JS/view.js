// Mulondi Makhado u24739163
var slideIndex = 1;

// Next/previous controls
function plusSlides(n) {
    showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("mySlides");
    var dots = document.getElementsByClassName("dot");
    if (n > slides.length) { slideIndex = 1; }
    if (n < 1) { slideIndex = slides.length; }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    if (slides.length > 0) {
        slides[slideIndex - 1].style.display = "block";
    }
    if (dots.length > 0) {
        dots[slideIndex - 1].className += " active";
    }
}

// Receives the variables from the url parameters 
document.addEventListener('DOMContentLoaded', function() {
    var products = JSON.parse(localStorage.getItem('products'));
    var urlParams = new URLSearchParams(window.location.search);
    var productID = urlParams.get('productID');
    var pInital = urlParams.get('inital');
    var pFinal = urlParams.get('final');
    var pDiscount = urlParams.get('discount');
    var pCurrency = urlParams.get('currency');

    // Determines if the product is a deal or not
    if (pDiscount != "NA") {
        loadProduct(products.data.find(function(product) { 
            return product.id == productID; 
        }), pInital, pFinal, pDiscount, pCurrency);
    } else {
        loadProduct(products.data.find(function(product) { 
            return product.id == productID; 
        }), pInital, pFinal, pDiscount, pCurrency); 
    }
});

// Loads the products details
function loadProduct(product, inital, final, discount, currency) {
    var arr = JSON.parse(product.images);
    var carousel = document.querySelector('.carousel');
    var dotBar = document.querySelector('.dot-bar');
    
    // Clear existing content
    carousel.innerHTML = '';
    dotBar.innerHTML = '';

    // Adds slides and dots for each image
    arr.forEach(function(image, index) {
        // Create slide
        var slide = document.createElement('div');
        slide.className = 'mySlides fade';
        slide.style.display = index === 0 ? 'block' : 'none';
        
        var img = document.createElement('img');
        img.className = 'carousel-image';
        img.src = image;
        img.alt = product.brand;
        
        slide.appendChild(img);
        carousel.appendChild(slide);

        // Creates dots
        var dot = document.createElement('span');
        dot.className = 'dot' + (index === 0 ? ' active' : '');
        dot.onclick = function() { currentSlide(index + 1); };
        dotBar.appendChild(dot);
    });

    // Adds navigation arrows
    var prev = document.createElement('a');
    prev.className = 'prev';
    prev.innerHTML = '&#10094;';
    prev.onclick = function() { plusSlides(-1); };
    
    var next = document.createElement('a');
    next.className = 'next';
    next.innerHTML = '&#10095;';
    next.onclick = function() { plusSlides(1); };
    
    carousel.appendChild(prev);
    carousel.appendChild(next);

    // Add product details
    var detailsDiv = document.createElement('div');
    detailsDiv.innerHTML = '<h3>' + product.brand + '</h3>';
    
    if (discount != "NA") {
        detailsDiv.innerHTML += 
            '<p>' + currency + ': ' +
                '<span class="new-price">' + final + ' ' + '</span>' +
                '<span class="original-price">' + inital + ' ' + '</span>' +
                '<span class="discount">' + discount + '% OFF</span>' + 
            '</p>';
    } else {
        detailsDiv.innerHTML += 
            '<p>' + currency + ': ' + inital + '</p>';
    }
    
    detailsDiv.innerHTML +=
        '<button class="wishlist">Wishlist</button>' +
        '<button class="cart">Add to Cart</button>';
    
    carousel.appendChild(detailsDiv);

    // Add the description, categories and features to the page
    var categoriesArray = JSON.parse(product.categories);
    var featuresArray = JSON.parse(product.features);
    var descriptionContainer = document.querySelector('.description-container');
    
    descriptionContainer.innerHTML = 
        '<p><b>Description:</b><br>' + ' ' + product.description + '</p>' +
        '<div>' +
            '<p><b>Features:</b><br>'+ featuresArray.join(' ') + '</p>' +
            '<p><b>Categories:</b><br> ' + categoriesArray.join(' ') + ' </p>' +
            '<p><b>Country of Origin:</b><br>' + product.country_of_origin + '</p>' +
        '</div>';

    // Initialize slides
    showSlides(slideIndex);
}