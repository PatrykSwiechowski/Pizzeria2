import {select, classNames, settings, templates } from "./settings.js";
import Product from './compontents/Product.js';
import Cart from './compontents/Cart.js';
import Booking from "./compontents/Booking.js";
  


  const app = {
    initPages: function(){ // jest uruchamiana w momemncie odświeżenia strony
      const thisApp = this;

      thisApp.pages = document.querySelector(select.containerOf.pages).children;
      thisApp.navLinks = document.querySelectorAll(select.nav.links);

      const idFromHash = window.location.hash.replace('#/', '');
      console.log('idFromHash', idFromHash)

      let pageMatchingHash = thisApp.pages[0].id;
      for(let page of thisApp.pages){
        if(page.id == idFromHash){
          pageMatchingHash = page.id;
          break;
        }

      }
      console.log('pageMatchingHash'. pageMatchingHash);
      thisApp.activePage(pageMatchingHash);


      for(let link of thisApp.navLinks){
        link.addEventListener('click', function(event){
          const clickedElement = this;
          event.preventDefault();

          /* get page id from href attribute*/
          const id = clickedElement.getAttribute('href').replace('#', '');
          /* run thisApp.activePage with that id*/
          thisApp.activePage(id); 

          /*change URL hash*/
          window.location.hash = '#/' + id; // slash zapobiega przesunieciu się strony, która po odświeżeniu przesuwa się do elememtu, któy ma id takie samo jak treść po znaku hash w adresie url strony
        })
      }
    },

    activePage: function(pageId){
      const thisApp = this;

      for(let page of thisApp.pages){
        //if(page.id == pageId){
          page.classList.toggle(classNames.pages.active, page.id == pageId); // drugi argument jest warunkiem czy id kliknietej strony jest równe id strony podanej w atrybucie metody
        //}
      }
      for(let link of thisApp.navLinks){
        link.classList.toggle(
        classNames.nav.active, link.getAttribute('href') == '#' + pageId 
        );
      }
      

    },

    initBooking: function(){
      const thisApp = this;
      
      const bookingWrapper = document.querySelector(select.containerOf.booking);

      thisApp.booking = new Booking(bookingWrapper);

    },
    
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

      thisApp.initPages();

      thisApp.initData();
      thisApp.initCart();
      thisApp.initBooking();
    },
  };

  app.init();

