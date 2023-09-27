import { select, classNames, settings, templates } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();

      console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {}; // Tworzymy obiekt z elementami DOM od tej pory  w nim przechowujemy referencje do elementów DOM
      thisCart.dom.wrapper = element;
      console.log(element)
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector (select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    }

    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });
      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
      })

    }

    sendOrder(){
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.orders; // endpoint do kolekcji order w app.json

      const payload = { // obiekt z danymi ktory wysylamy do servera czyli do app.json "orders:"
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFree: thisCart.deliveryFree,
        products: [],
      };
      for(let product of thisCart.products){
        payload.products.push(product.getData());
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      
      fetch(url, options)
      .then(function (response){
        return response.json();
      }).then(function (parsedResponse){
        console.log('parsedResponse:', parsedResponse);
      });
    }
  
/*Podsumujmy teraz całość.

Zaczynamy od stałej url, w której, podobnie jak wcześniej, umieszczamy adres endpointu.
Tym razem będziemy się kontaktować z endopointem zamówienia (order).

Następnie deklarujemy stałą payload, czyli ładunek.
Tak bardzo często określa się dane, które będą wysłane do serwera.

Kolejna stała – options – zawiera opcje, które skonfigurują zapytanie.
Po pierwsze, musimy zmienić domyślną metodę GET na metodę POST, która służy do wysyłania nowych danych do API.
Następnie musimy ustawić nagłówek, aby nasz serwer wiedział, że wysyłamy dane w postaci JSON-a.
Ostatni z nagłówków to body, czyli treść, którą wysyłamy. Używamy tutaj metody JSON.stringify, aby przekonwertować obiekt payload na ciąg znaków w formacie JSON.
Możesz zauważyć, że tym razem nie przypięliśmy do wywołania fetch żadnej funkcji w .then. Dlaczego?
A czy musimy? Zauważ, że tak naprawdę teraz, nie odbieramy żadnych danych. Wręcz przeciwnie, to my je wysyłamy.
Nie za bardzo więc obchodzi nas, co serwer zwróci jako odpowiedź.*/
      

    

    remove(cartProduct){ // cartProduct to ThisCartProduct
       const thisCart = this;
        cartProduct.dom.wrapper.remove()// usuwamy cartProduct czyli reprezentajce produktu z kontenera Cart czyli koszyka
        const deleteProduct = thisCart.products.indexOf(cartProduct); // znajdujemy produkt w tablicy z dodanymi produktami
        thisCart.products.splice(deleteProduct,1)
        thisCart.update();
    }

    add(menuProduct){ // wysyłanie produktów do koszyka
      const thisCart = this;
      console.log(menuProduct);
      

      const generatedHtml = templates.cartProduct(menuProduct); //generowanie kodu html pojedynczego produktu w koszyku
      //console.log(generatedHtml);
      const generatedDOM = utils.createDOMFromHTML(generatedHtml); // tworzenie elementu dom, tzn. przekształcenie kodu HTML, który jest zwykłym stringiem na obiekt, który ma właściowości czy metody
      console.log(generatedDOM);
      thisCart.dom.productList.appendChild(generatedDOM);
      
      console.log('adding product', menuProduct);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM)); // W ten sposób jednocześnie stworzymy nową instancję klasy new CartProduct oraz dodamy ją do tablicy thisCart.products 
      console.log('thisCart.products', thisCart.products);

      thisCart.update();
    }

    update(){
      const thisCart = this;
      thisCart.deliveryFree = settings.cart.defaultDeliveryFee;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for(let product of thisCart.products){
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;
      }
      if(thisCart.totalNumber !== 0){
        thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFree;
      }else{
        thisCart.totalPrice = 0;
      }

      console.log (thisCart.deliveryFree, thisCart.totalNumber, thisCart.subtotalPrice, thisCart.totalPrice);

      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      //thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFree;
      for(let price of thisCart.dom.totalPrice){
        //console.log(thisCart.dom.totalPrice);
       //console.log(price);
        price.innerHTML = thisCart.totalPrice;
    }
    
      }

    }

    export default Cart;
