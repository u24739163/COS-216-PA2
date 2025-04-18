//Mulondi Makhado u24739163

// Convery currency is synchronous since it determines the actual price the products use thus it's value is needed first before the products are added.
// Load currency list is synchronous since it determines the currency used by all the functions that take in the selected currency like the load products function so it has to be loaded first in order to provide the currency.
// Load products and load filters are asyhronous since they aren't requied by any other function so no waiting is needed.
// Convert range is synchronous since it determines the range of the products that are to be loaded so it has to loaded first before the products are loaded.

//Loding screen
var loadingScreen = document.getElementById("loading-screen");
var doFilter = false;
//Functions to run when the page loads
window.onload = function load() {
    showLoading();
    loadCurrencyList("ZAR");
    convertRange("ZAR");
    loadProducts("ZAR");
    loadFilters("category");
    loadFilters("country");
    loadFilters("brand");
};

//Gets the value of the currency dropdown, search bar and sort dropdown elements 
var selectElement = document.getElementById("Currency");
var searchElement = document.getElementById("search");
var sortElement = document.getElementById("Sort");


//Event listener for the currency dropdown list element
selectElement.addEventListener('change', function(event) {
    showLoading();
    changeCurrency(event.target.value);
});

//Event listener for the search bar element
searchElement.addEventListener('change', function() {
    showLoading();

    //Loads the products with the search value applied
    loadProducts(selectElement.value, "search", searchElement.value);
});

//Event listener for the sort dropdown list element
sortElement.addEventListener('change', function() {
    showLoading();
    //The sort is done by manipulating the call to the API so the following function calls don't do anything diffrent
    //This if is just to see if there is anything in the search bar so that the search isn't overriden 
    
    if(doFilter == true) {
     applyFilters.click();
    }
    else
    if(searchElement.value != "") {
         //Loads the products with the search value applied
        loadProducts(selectElement.value, "search", searchElement.value);
    }
    else {
        //Loads the products like normal
        loadProducts(selectElement.value);
    }
    
});

//Shows the loading screen
function showLoading() {
    loadingScreen.style.display = "flex";
}

//Hides the loading screen
function hideLoading() {
    loadingScreen.style.display = "none";
}

//Changes the currency using the selected currency from the dropdown list element
function changeCurrency(currency) {
    selectElement.value = currency;
    loadCurrencyList(currency);
    convertRange(currency);
    //Validates the search to prevent the search from being overriden
    if(searchElement.value != "") {
        loadProducts(currency, "search", searchElement.value);
    }
    else {
        loadProducts(currency);
    }
}

//Converts the price of the product to the selected currency where the price is the actual price of the product and the newCurrency is the selected currency from the dropdown list element
function convertCurrency(price, newCurrency) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://wheatley.cs.up.ac.za/api/", false);

    //Some variables for the conversion
    var newCurrencyValue = 0;

    //The currencyData is the data that is used to make a call to the API. It's not used anywhere else so it didn't put it inside the requests() function
    var currencyData = {
        "studentnum":"u24739163",
        "apikey":"897822eaee48b36187597c09fa814592",
        "type": "GetCurrencyList"
    };
    //Sends the currencyData to the API
    xhttp.send(JSON.stringify(currencyData));
    if(xhttp.readyState == 4 && xhttp.status == 200) {
        var currencyList = JSON.parse(xhttp.responseText);
        //ZAR = currencyList.data["ZAR"];
        newCurrencyValue = currencyList.data[newCurrency];
        console.log(newCurrencyValue);
        //The converted currency
        return newCurrencyValue * price;
    }
    else {
        document.body.innerHTML = requests("error");
        console.log("Error");
    }
}

//Loads the currency list from the API
function loadCurrencyList(selectedCurrency) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://wheatley.cs.up.ac.za/api/", false);
    xhttp.onload = function() {
        if(this.status == 200) {
            //Recives the currency list from the API
            var currencyList = JSON.parse(this.responseText);
            var output = '';
            var selectedCurrencyIndex = 0;
            var index = 0;
            //For each currency(3 character string) in the currencyList, the currency is added to the dropdown list element
            for(var currency in currencyList.data) {
                //If the currency is the selected currency, the selectedCurrencyIndex is set to the index of the selected currency
                //This is used to get the index of the selected currency in the dropdown list element so that it appears as the displayed option in the dropdown list element
                if(currency == selectedCurrency) {
                    selectedCurrencyIndex = index;
                    //returnPrice = currencyList.data[currency];
                }
                index++;
                //The output is the currency in the dropdown list element
                output += 
                '<option value="' + currency + '">' + currency + '</option>';
            }
            //The dropdown list element is set to the output
            document.querySelector('#Currency').innerHTML = output;

            //The dropdown list element's displayed option is set to the selected currency
            var selectElement = document.getElementById("Currency");
            selectElement.selectedIndex = selectedCurrencyIndex;
        }
        else {
            document.body.innerHTML = requests("error");
            console.log("Error");
        }
    };
    //Sends the API call using the returned variable from the function requests()
    xhttp.send(JSON.stringify(requests("currencyData")));
}

//Loads the individual products html. loadType is used for the search
function loadProducts(selectedCurrency, modifyProducts, modifyProductsCriteria) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://wheatley.cs.up.ac.za/api/", true);
    xhttp.onload = function() {
        if(this.status == 200) {
            var products = JSON.parse(this.responseText);
            //Determines the conditon of the final conditon for the product
            var searchCondition;
            var priceCondition;
            var categoryCondition;
            var countryCondition;
            var brandCondition;
            var filterCondition;
            var condition;


            if(modifyProducts == "search") {
                searchCondition = function(product) { 
                    return product.brand.toLowerCase().indexOf(modifyProductsCriteria.toLowerCase()) !== -1; 
                };
            }
            if(modifyProducts == "search&filter") {
                searchCondition = function(product) { 
                    return product.brand.toLowerCase().indexOf(modifyProductsCriteria[4].toLowerCase()) !== -1; 
                };
            }
            if(modifyProducts == "filter" || modifyProducts == "search&filter") {
                if(modifyProductsCriteria[0] == 0) {
                    priceCondition = function(product) { return true; };
                }
                else if(modifyProductsCriteria[0] == 1) {
                    priceCondition = function(product) { 
                        return product.initial_price >= 0 && product.initial_price <= 50; 
                    };
                }
                else if(modifyProductsCriteria[0] == 2) {
                    priceCondition = function(product) { 
                        return product.initial_price >= 50 && product.initial_price <= 100; 
                    };
                }
                else if(modifyProductsCriteria[0] == 3) {
                    priceCondition = function(product) { 
                        return product.initial_price >= 100 && product.initial_price <= 200; 
                    };
                }
                else if(modifyProductsCriteria[0] == 4) {
                    priceCondition = function(product) { 
                        return product.initial_price >= 200; 
                    };
                }
     
                if(modifyProductsCriteria[1] != 0) {
                    categoryCondition = function(product) { 
                        return product.department == modifyProductsCriteria[1]; 
                    };
                }
                else {
                    categoryCondition = function(product) { return true; };
                }
                if(modifyProductsCriteria[2] != 0) {
                    countryCondition = function(product) { 
                        return product.country_of_origin == modifyProductsCriteria[2]; 
                    };
                }
                else {
                    countryCondition = function(product) { return true; };
                }
                if(modifyProductsCriteria[3] != 0) {
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
             
            if(modifyProducts == "search&filter") {
                condition = function(product) { 
                    return searchCondition(product) && filterCondition(product); 
                };
            }
            else if(modifyProducts == "search") {
                condition = function(product) { 
                    return searchCondition(product); 
                };
            }
            else if(modifyProducts == "filter") {
                condition = function(product) { 
                    return filterCondition(product); 
                };
            }
            else {
                condition = function() { return true; };
            }

            var output = '';
             localStorage.setItem("products", this.responseText);
            //If the API call was successful, the products are looped through and the product information is added to the output
            if(products.status === "success") {
                products.data.forEach(function(product) {
                    //Truncates the displayed product name to 20 characters so products will long name won't look weird
                    if(product.brand.length > 20) {
                        product.brand = product.brand.substring(0, 20) + "...";
                    }

                    //Runs the convertCurrency function to convert the product price to the selected currency
                    var outputPrice = convertCurrency(product.initial_price, selectedCurrency).toFixed(2);
                    //console.log(product.country_of_origin);
                    //Adds the product information to the output
                    if(condition(product)) {
                        output += 
                        '<a href="./view.html?productID=' + product.id + '&inital=' + outputPrice + '&final=NA' + '&discount=NA' + '&currency=' + selectedCurrency + '">' +
                            '<div class="product">' +
                                '<img src="' + product.image_url + '" alt="' + product.brand + '">' +
                                '<h3>' + product.brand + '</h3>' +
                                '<p>' + selectedCurrency + ' ' + outputPrice + '</p>' +
                                '<button class="wishlist">Wishlist</button>' +
                                '<button class="cart">Add to Cart</button>' +
                            '</div>' +
                        '</a>';
                    }
                });
            }
            else {
                //If the API call was not successful, an error message is displayed
                output += '<div class="error-container"><h2 class="error">No products found.</h2></div>';
            }
            if(output == '')
            {
                output = '<div class="error-container"><h2 class="error">No products found.</h2></div>';
            }
            //Outputs the product information
            document.querySelector('.products').innerHTML = output;
        }
        else {
            //If the API call was not successful, an error message is displayed
            document.body.innerHTML = requests("error");
            console.log("Error");
        }
        hideLoading();
    };
        //Sends the API call using the returned variable from the function requests()
        xhttp.send(JSON.stringify(requests("productsData")));
}

//This function holds variables that are big and used multiple times. This is where the sorting is done 
function requests(chosen) {
    //chosen is a string that's just used to determine what data to return
    if(chosen == 'productsData') {
        //These are the base variables that are used in the API call
        var order = "ASC";
        var sortType = "title";

        //These are the variables that are used to sort the products by manipulating the API call
        if(sortElement.value == 'PriceLH') {
            sortType = "initial_price";
        }
        else if(sortElement.value == 'PriceHL') {
            sortType = "initial_price";
            order = "DESC";
        }
        else if(sortElement.value == 'Newest') {
            sortType = "date_first_available";
            order = "DESC";
        }

        //This is the data that will be sent to the API
        var productsData = {
            "studentnum": "u24739163",
            "apikey": "897822eaee48b36187597c09fa814592",
            "type": "GetAllProducts",
            "sort": sortType,
            "order": order,
            "return": "*",
            "limit": 100
        };

        //This returns the data so all the requests("productsData") functions will return this for the API to use
        return productsData;
    }
    else if(chosen == 'currencyData') {
        //This is the data sent to the API to get the currency data
        var currencyData = {
            "studentnum":"u24739163",
            "apikey":"897822eaee48b36187597c09fa814592",
            "type": "GetCurrencyList"
        };
        return currencyData;
    }
    else if(chosen == 'category') {
         var categoryData = {
             "studentnum":"u24739163",
              "apikey":"897822eaee48b36187597c09fa814592",
              "type": "GetDistinct",
              "field": "department",
              "limit": 20
         };
         return categoryData;
    }
    else if(chosen == 'country') {
          var countryData = {
              "studentnum":"u24739163",
              "apikey":"897822eaee48b36187597c09fa814592",
              "type": "GetDistinct",
              "field": "country_of_origin",
              "limit": 20
          };
          return countryData;
    }
    else if(chosen == 'brand') {
          var brandData = {
              "studentnum":"u24739163",
              "apikey":"897822eaee48b36187597c09fa814592",
              "type": "GetDistinct",
              "field": "brand",
              "limit": 20
          };
          return brandData;
    }
    else if(chosen == 'error') {
        //This is the html that will be displayed when the API call fails
        var error = 
        '<body>' +
            '<p class="pError"><b>OOPS... <br><br>SOMETHINGS <br> WENT, <br> Wrong :(</b></p>' +
            '<div><div><img class="image-error" src="./Images/Brand/SpiltBeans.png" alt="Logo"></div>' +
        '</body>';
        return error;
    }
}

// The filter panel functionality
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
   
// Closes the panel when clicking on overlay
overlay.addEventListener('click', function() {
    filterPanel.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
});
   
// Applies the filters
applyFilters.addEventListener('click', function() {
    // Get all selected filters
    var priceRange = document.querySelector('input[name="price-type"]:checked');
    priceRange = priceRange ? priceRange.value : undefined;
    var category = document.querySelector('input[name="category-type"]:checked');
    category = category ? category.value : undefined;
    var country = document.querySelector('input[name="country-type"]:checked');
    country = country ? country.value : undefined;
    var brand = document.querySelector('input[name="brand-type"]:checked');
    brand = brand ? brand.value : undefined;

    /*console.log('Selected filters:', {
        priceRange: priceRange,
        category: category,
        country: country,
        brand: brand
    });*/
     
    // Determines if filters should be applied when a search is done
    if(priceRange != 0 || category != 0 || country != 0 || brand != 0) {
        doFilter = true;
    }
 
    // Close the panel after applying filters
    filterPanel.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
       
    if(searchElement.value != "") {
        showLoading();
        loadProducts(selectElement.value, "search&filter", [priceRange,category,country,brand,searchElement.value]);
    }
    else {
        showLoading();
        loadProducts(selectElement.value, "filter", [priceRange,category,country,brand]);
    }
});
   
// Prevent panel from closing when clicking inside it
filterPanel.addEventListener('click', function(e) {
    e.stopPropagation();
});

//Gets all the filters and shows them in the panel
function loadFilters(filter) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://wheatley.cs.up.ac.za/api/", true);

    xhttp.onload = function() {
        if(this.status == 200) {
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

// Converts the currency of the range
function convertRange(newCurrency) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://wheatley.cs.up.ac.za/api/", false);

    //Some variables for the conversion
    var newCurrencyValue = 0;
    var output;

    //The currencyData is the data that is used to make a call to the API. It's not used anywhere else so it didn't put it inside the requests() function
    var currencyData = {
        "studentnum":"u24739163",
        "apikey":"897822eaee48b36187597c09fa814592",
        "type": "GetCurrencyList"
    };
    //Sends the currencyData to the API
    xhttp.send(JSON.stringify(currencyData));
    if(xhttp.readyState == 4 && xhttp.status == 200) {
        var currencyList = JSON.parse(xhttp.responseText);
        newCurrencyValue = currencyList.data[newCurrency];
        //The converted currency
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