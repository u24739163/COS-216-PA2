//Mulondi Makhado u24739163

// Convery currency is synchronous since it determines the actual price the products use thus it's value is needed first before the products are added.
// Load currency list is synchronous since it determines the currency used by all the functions that take in the selected currency like the load products function so it has to be loaded first in order to provide the currency.
// Load products and load filters are asyhronous since they aren't requied by any other function so no waiting is needed.
// Convert range is synchronous since it determines the range of the products that are to be loaded so it has to loaded first before the products are loaded.

// Loading screen
var loadingScreen = document.getElementById("loading-screen");
var doFilter = false;

// Functions to run when the page loads
window.onload = function load() {
    showLoading();
    loadCurrencyList("ZAR");
    convertRange("ZAR");
    loadProducts("ZAR");
    loadFilters("category");
    loadFilters("country");
    loadFilters("brand");
};

// Gets the value of the currency dropdown, search bar and sort dropdown elements 
var selectElement = document.getElementById("Currency");
var searchElement = document.getElementById("search");
var sortElement = document.getElementById("Sort");

// Event listener for the currency dropdown list element
selectElement.addEventListener('change', function(event) {
    showLoading();
    changeCurrency(event.target.value);
});

// Event listener for the search bar element
searchElement.addEventListener('change', function() {
    showLoading();
    // Loads the products with the search value applied
    loadProducts(selectElement.value, "search", searchElement.value);
});

// Event listener for the sort dropdown list element
sortElement.addEventListener('change', function() {
    showLoading();
    // The sort is done by manipulating the call to the API so the following function calls don't do anything different
    // This if is just to see if there is anything in the search bar so that the search isn't overridden 
    if (doFilter == true) {
        applyFilters.click();
    }
    else if (searchElement.value != "") {
        // Loads the products with the search value applied
        loadProducts(selectElement.value, "search", searchElement.value);
    }
    else {
        // Loads the products like normal
        loadProducts(selectElement.value);
    }
});

// Shows the loading screen
function showLoading() {
    loadingScreen.style.display = "flex";
}

// Hides the loading screen
function hideLoading() {
    loadingScreen.style.display = "none";
}

// Changes the currency using the selected currency from the dropdown list element
function changeCurrency(currency) {
    selectElement.value = currency;
    loadCurrencyList(currency);
    convertRange(currency);

    // Validates the search to prevent the search from being overridden
    if (searchElement.value != "") {
        loadProducts(currency, "search", searchElement.value);
    }
    else {
        loadProducts(currency);
    }
}

// Converts the price of the product to the selected currency
function convertCurrency(price, newCurrency) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://wheatley.cs.up.ac.za/api/", false);

    // Some variables for the conversion
    var newCurrencyValue = 0;

    // The currencyData is the data that is used to make a call to the API
    var currencyData = {
        "studentnum": "u24739163",
        "apikey": "897822eaee48b36187597c09fa814592",
        "type": "GetCurrencyList"
    };
    
    // Sends the currencyData to the API
    xhttp.send(JSON.stringify(currencyData));
    if (xhttp.readyState == 4 && xhttp.status == 200) {
        var currencyList = JSON.parse(xhttp.responseText);
        newCurrencyValue = currencyList.data[newCurrency];
        console.log(newCurrencyValue);
        // The converted currency
        return newCurrencyValue * price;
    }
    else {
        document.body.innerHTML = requests("error");
        console.log("Error");
    }
}

// Loads the currency list from the API
function loadCurrencyList(selectedCurrency) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://wheatley.cs.up.ac.za/api/", false);
    xhttp.onload = function() {
        if (this.status == 200) {
            // Receives the currency list from the API
            var currencyList = JSON.parse(this.responseText);
            var output = '';
            var selectedCurrencyIndex = 0;
            var index = 0;
            
            // For each currency in the currencyList
            for (var currency in currencyList.data) {
                if (currency == selectedCurrency) {
                    selectedCurrencyIndex = index;
                }
                index++;
                output += '<option value="' + currency + '">' + currency + '</option>';
            }
            
            document.querySelector('#Currency').innerHTML = output;
            var selectElement = document.getElementById("Currency");
            selectElement.selectedIndex = selectedCurrencyIndex;
        }
        else {
            document.body.innerHTML = requests("error");
            console.log("Error");
        }
    };
    xhttp.send(JSON.stringify(requests("currencyData")));
}

// Loads the individual products html
function loadProducts(selectedCurrency, modifyProducts, modifyProductsCriteria) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://wheatley.cs.up.ac.za/api/", true);
    xhttp.onload = function() {
        if (this.status == 200) {
            var products = JSON.parse(this.responseText);
            
            // Determine conditions based on modifyProducts

            var searchCondition;
            var priceCondition;
            var categoryCondition;
            var countryCondition;
            var brandCondition;
            var filterCondition;
            var condition;

            if (modifyProducts == "search") {
                searchCondition = function(product) {
                    return product.brand.toLowerCase().indexOf(modifyProductsCriteria.toLowerCase()) !== -1;
                };
            }
            if (modifyProducts == "search&filter") {
                searchCondition = function(product) {
                    return product.brand.toLowerCase().indexOf(modifyProductsCriteria[4].toLowerCase()) !== -1;
                };
            }

            // Add the the relevent filter conditond to the final conditon based on the modifyProductsCriteria values
            if (modifyProducts == "filter" || modifyProducts == "search&filter") {
                if (modifyProductsCriteria[0] == 0) {
                    priceCondition = function(product) { return true; };
                }
                else if (modifyProductsCriteria[0] == 1) {
                    priceCondition = function(product) {
                        return product.initial_price >= 0 && product.initial_price <= 50;
                    };
                }
                else if (modifyProductsCriteria[0] == 2) {
                    priceCondition = function(product) {
                        return product.initial_price >= 50 && product.initial_price <= 100;
                    };
                }
                else if (modifyProductsCriteria[0] == 3) {
                    priceCondition = function(product) {
                        return product.initial_price >= 100 && product.initial_price <= 200;
                    };
                }
                else if (modifyProductsCriteria[0] == 4) {
                    priceCondition = function(product) {
                        return product.initial_price >= 200;
                    };
                }

                if (modifyProductsCriteria[1] != 0) {
                    categoryCondition = function(product) {
                        return product.department == modifyProductsCriteria[1];
                    };
                }
                else {
                    categoryCondition = function(product) { return true; };
                }
                
                if (modifyProductsCriteria[2] != 0) {
                    countryCondition = function(product) {
                        return product.country_of_origin == modifyProductsCriteria[2];
                    };
                }
                else {
                    countryCondition = function(product) { return true; };
                }
                
                if (modifyProductsCriteria[3] != 0) {
                    brandCondition = function(product) {
                        return product.brand == modifyProductsCriteria[3];
                    };
                }
                else {
                    brandCondition = function(product) { return true; };
                }

                filterCondition = function(product) {
                    return (priceCondition(product) && categoryCondition(product) && countryCondition(product) && brandCondition(product));
                };
            }

            // Detemines the final conditon that will be applied to the products
            if (modifyProducts == "search&filter") {
                condition = function(product) {
                    return searchCondition(product) && filterCondition(product);
                };
            }
            else if (modifyProducts == "search") {
                condition = function(product) {
                    return searchCondition(product);
                };
            }
            else if (modifyProducts == "filter") {
                condition = function(product) {
                    return filterCondition(product);
                };
            }
            else {
                condition = function() { return true; };
            }

            var output = '';
            localStorage.setItem("products", this.responseText);
            if (products.status === "success") {
                // Sorting logic for the discount when a sort is applied
                if (sortElement.value == "DiscountLH") {
                    products.data.sort(function(a, b) {
                        var discountA = ((a.initial_price - a.final_price) / a.initial_price) * 100;
                        var discountB = ((b.initial_price - b.final_price) / b.initial_price) * 100;
                        if (discountA < discountB) { return -1; }
                        if (discountA > discountB) { return 1; }
                        return 0;
                    });
                }
                else if (sortElement.value == "DiscountHL") {
                    products.data.sort(function(a, b) {
                        var discountA = ((a.initial_price - a.final_price) / a.initial_price) * 100;
                        var discountB = ((b.initial_price - b.final_price) / b.initial_price) * 100;
                        if (discountA > discountB) { return -1; }
                        if (discountA < discountB) { return 1; }
                        return 0;
                    });
                }

                // Adds the products to the output
                products.data.forEach(function(product) {
                    if (product.brand.length > 20) {
                        product.brand = product.brand.substring(0, 20) + "...";
                    }

                    // Gets the final price of the product after convertion
                    var outputPriceOriginal = convertCurrency(product.initial_price, selectedCurrency).toFixed(2);
                    var outputPriceNew = convertCurrency(product.final_price, selectedCurrency).toFixed(2);
                    var discount = parseInt(((outputPriceOriginal - outputPriceNew) / outputPriceOriginal) * 100);

                    if (condition(product) && discount > 10) {
                        output += 
                        '<a href="./view.html?productID=' + product.id  + '&inital=' + outputPriceOriginal + '&final=' + outputPriceNew + '&discount=' + discount + '&currency=' + selectedCurrency + '">' +
                            '<div class="product">' +
                                '<img src="' + product.image_url + '" alt="' + product.brand + '">' +
                                '<h3>' + product.brand + '</h3>' +
                                '<p class="price">' +
                                    '<span class="original-price">' + outputPriceOriginal + '</span>' +
                                    '<span class="new-price">' + outputPriceNew + '</span>' +
                                    '<span class="discount">' + discount + '% OFF</span>' +
                                '</p>' +
                                '<button class="wishlist">Wishlist</button>' +
                                '<button class="cart">Add to Cart</button>' +
                            '</div>' +
                        '</a>';
                    }
                });
            }
            else {
                output += '<div class="error-container"><h2 class="error">No products found.</h2></div>';
            }
            // Determines if noo product was found
            if(output == '')
            {
                output = '<div class="error-container"><h2 class="error">No products found.</h2></div>';
            }
            document.querySelector('.products').innerHTML = output;
        }
        else {
            document.body.innerHTML = requests("error");
            console.log("Error");
        }
        hideLoading();
    };
    xhttp.send(JSON.stringify(requests("productsData")));
}

// This function holds variables that are big and used multiple times
function requests(chosen) {
    
    if (chosen == 'productsData') {
        // Gets the products data from the API
        // Determines the sorting needed so it can be passed to the API in the call
        var order = "ASC";
        var sortType = "title";

        if (sortElement.value == 'PriceLH') {
            sortType = "final_price";
        }
        else if (sortElement.value == 'PriceHL') {
            sortType = "final_price";
            order = "DESC";
        }
        else if (sortElement.value == 'Newest') {
            sortType = "date_first_available";
            order = "DESC";
        }

        var productsData = {
            "studentnum": "u24739163",
            "apikey": "897822eaee48b36187597c09fa814592",
            "type": "GetAllProducts",
            "sort": sortType,
            "order": order,
            "return": "*",
            "limit": 100
        };

        return productsData;
    }
    else if (chosen == 'currencyData') {
        // Gets the currency data from the API
        var currencyData = {
            "studentnum": "u24739163",
            "apikey": "897822eaee48b36187597c09fa814592",
            "type": "GetCurrencyList"
        };
        return currencyData;
    }
    else if (chosen == 'category') {
        // Gets the category data from the API
        var categoryData = {
            "studentnum": "u24739163",
            "apikey": "897822eaee48b36187597c09fa814592",
            "type": "GetDistinct",
            "field": "department",
            "limit": 20
        };
        return categoryData;
    }
    else if (chosen == 'country') {
        // Gets the country data from the API
        var countryData = {
            "studentnum": "u24739163",
            "apikey": "897822eaee48b36187597c09fa814592",
            "type": "GetDistinct",
            "field": "country_of_origin",
            "limit": 20
        };
        return countryData;
    }
    else if (chosen == 'brand') {
        // Gets the brand data from the API
        var brandData = {
            "studentnum": "u24739163",
            "apikey": "897822eaee48b36187597c09fa814592",
            "type": "GetDistinct",
            "field": "brand",
            "limit": 20
        };
        return brandData;
    }
    else if (chosen == 'error') {
        // Returns an error message
        var error = 
        '<body>' +
            '<p class="pError"><b>OOPS... <br><br>SOMETHINGS <br> WENT, <br> Wrong :(</b></p>' +
            '<div><div><img class="image-error" src="./Images/Brand/SpiltBeans.png" alt="Logo"></div>' +
        '</body>';
        return error;
    }
}

// Filter panel functionality
var filterBtn = document.getElementById('filterBtn');
var filterPanel = document.getElementById('filterPanel');
var closeFilter = document.getElementById('closeFilter');
var overlay = document.getElementById('overlay');
var applyFilters = document.getElementById('applyFilters');

// Toggles the filter panel
filterBtn.addEventListener('click', function() {
    filterPanel.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Closes the filter panel
closeFilter.addEventListener('click', function() {
    filterPanel.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
});

// Closes the panel when clicking on the overlay
overlay.addEventListener('click', function() {
    filterPanel.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
});

// Applies the filters
applyFilters.addEventListener('click', function() {
    // Gets all selected filters
    var priceRange = document.querySelector('input[name="price-type"]:checked');
    priceRange = priceRange ? priceRange.value : undefined;
    var category = document.querySelector('input[name="category-type"]:checked');
    category = category ? category.value : undefined;
    var country = document.querySelector('input[name="country-type"]:checked');
    country = country ? country.value : undefined;
    var brand = document.querySelector('input[name="brand-type"]:checked');
    brand = brand ? brand.value : undefined;

    // Determines if filters should be applied when a search is done
    if(priceRange != 0 || category != 0 || country != 0 || brand != 0) {
        doFilter = true;
    }

    // Closes the panel when applying the filters
    filterPanel.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';

    // Determines if a search was made
    if (searchElement.value != "") {
        showLoading();
        loadProducts(selectElement.value, "search&filter", [priceRange, category, country, brand, searchElement.value]);
    }
    else {
        showLoading();
        loadProducts(selectElement.value, "filter", [priceRange, category, country, brand]);
    }
});

// Prevent panel from closing when clicking inside it
filterPanel.addEventListener('click', function(e) {
    e.stopPropagation();
});

// Loads the filters
function loadFilters(filter) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://wheatley.cs.up.ac.za/api/", true);

    xhttp.onload = function() {
        if (this.status == 200) {
            var list = JSON.parse(this.responseText);
            var output = 
            '<div class="filter-option">' +
                '<input type="radio" name="' + filter + '-type" value="0" checked>' +
                '<label>No filter</label>' +
            '</div>';

            list.data.forEach(function(item) {
                output += 
                '<div class="filter-option">' +
                    '<input type="radio" name="' + filter + '-type" value="' + item + '">' +
                    '<label>' + item + '</label>' +
                '</div>';
            });

            switch(filter) {
                case "category":
                    document.querySelector("#category-filter").innerHTML = output;
                    break;
                case "country":
                    document.querySelector("#country-filter").innerHTML = output;
                    break;
                case "brand":
                    document.querySelector("#brand-filter").innerHTML = output;
                    break;
            }
        }
        else {
            document.body.innerHTML = requests("error");
            console.log("Error");
        }
    };

    xhttp.send(JSON.stringify(requests(filter)));
}

//Converts the currency on the range
function convertRange(newCurrency) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://wheatley.cs.up.ac.za/api/", false);

    var newCurrencyValue = 0;
    var output;
    var currencyData = {
        "studentnum": "u24739163",
        "apikey": "897822eaee48b36187597c09fa814592",
        "type": "GetCurrencyList"
    };

    xhttp.send(JSON.stringify(currencyData));
    if (xhttp.readyState == 4 && xhttp.status == 200) {
        var currencyList = JSON.parse(xhttp.responseText);
        newCurrencyValue = currencyList.data[newCurrency];
        output = 
        '<div class="filter-option">' +
            '<input type="radio" id="empty" name="price-type" value="0" checked>' +
            '<label>No filter</label>' +
        '</div>' +
        '<div class="filter-option">' +
            '<input type="radio" name="price-type" value="1">' +
            '<label>' + selectElement.value + ' ' + roundUp(0 * newCurrencyValue) + ' - ' + selectElement.value + ' ' + roundUp(50 * newCurrencyValue) + '</label>' +
        '</div>' +
        '<div class="filter-option">' +
            '<input type="radio" name="price-type" value="2">' +
            '<label>' + selectElement.value + ' ' + roundUp(50 * newCurrencyValue) + ' - ' + selectElement.value + ' ' + roundUp(100 * newCurrencyValue) + '</label>' +
        '</div>' +
        '<div class="filter-option">' +
            '<input type="radio" name="price-type" value="3">' +
            '<label>' + selectElement.value + ' ' + roundUp(100 * newCurrencyValue) + ' - ' + selectElement.value + ' ' + roundUp(200 * newCurrencyValue) + '</label>' +
        '</div>' +
        '<div class="filter-option">' +
            '<input type="radio" name="price-type" value="4">' +
            '<label>' + selectElement.value + ' ' + roundUp(200 * newCurrencyValue) + '+</label>' +
        '</div>';
        document.querySelector('#price-filter').innerHTML = output;
    }
    else {
        document.body.innerHTML = requests("error");
        console.log("Error");
    }
}

//Function to rounde up
function roundUp(num) {
    if (num === 0) return 0;
    var magnitude = Math.floor(Math.log10(num));
    var power = Math.pow(10, magnitude);
    return Math.ceil(num / power) * power;
}