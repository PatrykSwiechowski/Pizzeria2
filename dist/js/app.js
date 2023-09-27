import {select, classNames, settings, templates } from "./settings.js";
import Product from './compontents/Product.js';
import Cart from './compontents/Cart.js';
  


  const app = {
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
        //console.log(productData, thisApp.data.products[productData]); // pierwszy argument = dostęp do nazwy obiektu drugi argument = dostep do obiektu
      }
    },

    initData: function(){
      const thisApp = this;
      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;

      fetch(url) //Połącz się z adresem url przy użyciu metody fetch
      .then(function(rawResponse){
        return rawResponse.json(); // Jeśli połączenie się zakończy, to wtedy (pierwsze .then) skonwertuj dane do obiektu JS-owego.
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse); //Kiedy i ta operacja się zakończy, to wtedy (drugie .then) pokaż w konsoli te skonwertowane dane.
      /* save parsedResponse as thisApp.data.products*/
      thisApp.data.products = parsedResponse;
      /*execute initMenu method*/
      thisApp.initMenu();
      })
      
      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },

    initCart : function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      //console.log(cartElem);
      thisApp.cart = new Cart(cartElem); //instancję klasy Cart zapisaliśmy w thisApp.cart. Oznacza to, że poza obiektem app możemy wywołać ją za pomocą app.cart
    
      thisApp.productList = document.querySelector(select.containerOf.menu);
      thisApp.productList.addEventListener('add-to-cart', function(event) {

        app.cart.add(event.detail.product);

      })
    
    },


    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initCart();
    },
  };

  app.init();

