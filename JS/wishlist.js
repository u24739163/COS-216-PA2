//Mulondi Makhado u24739163

// Convery currency is synchronous since it determines the actual price the products use thus it's value is needed first before the products are added.
// Load currency list is synchronous since it determines the currency used by all the functions that take in the selected currency like the load products function so it has to be loaded first in order to provide the currency.
// Load products is asyhronous since it's not requied by any other function so no waiting is needed.

window.onload = function load()
{
    loadCurrencyList("ZAR");
    loadProducts("ZAR");
};

// Updates the currency if changed
var selectElement = document.getElementById("Currency");
selectElement.addEventListener('change', function(event) {
    selectElement.value = event.target.value;
    loadCurrencyList(event.target.value);
    loadProducts(event.target.value);
});

// Loads the products data
function loadProducts(currency) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://wheatley.cs.up.ac.za/api/", false);
    xhttp.onload = function() {
        if (this.status == 200) {
            var products = JSON.parse(this.responseText);
            var output = '<h2>Wishlist</h2>';
            
            // Loop through the products and display them
            for (var i = 0; i < 5; i++) {
                var product = products.data[i];
                var outputPrice = convertCurrency(product.final_price, currency).toFixed(2);

                output += 
                '<div class="wishlist-item" data-id="' + product.id + '">' +
                '<img src="' + product.image_url + '" alt="' + product.brand + '">' +
                '<div class="item-details">'+
                    '<h3>' + product.brand + '</h3>' +
                    '<p>' + currency + ' ' + outputPrice + '</p>' +
                '</div>'+
                '<button>Remove from Wishlist</button>'+
                '</div>';
            }
            
            document.querySelector('.wishlist').innerHTML = output;
        }
        else {
            document.body.innerHTML = requests("error");
            console.log("Error");
        }
    };
    xhttp.send(JSON.stringify(requests("productsData")));
}


// Load the currency list
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

function requests(chosen) {
    //chosen is a string that's just used to determine what data to return
    if(chosen == 'productsData') {
        //This is the data that will be sent to the API
        var productsData = {
            "studentnum": "u24739163",
            "apikey": "897822eaee48b36187597c09fa814592",
            "type": "GetAllProducts",
            "sort": "title",
            "order": "ASC",
            "return": "*",
            "limit": 5
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