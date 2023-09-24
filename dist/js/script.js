/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      //console.log('new Product:', thisProduct);
    }
    renderInMenu(){
      const thisProduct = this;

      const generatedHtml = templates.menuProduct(thisProduct.data); //generowanie kodu html pojedynczego produktu
      //console.log(generatedHtml);
      thisProduct.element = utils.createDOMFromHTML(generatedHtml); // tworzenie elementu dom, tzn. przekształcenie kodu HTML, który jest zwykłym stringiem na obiekt, który ma właściowości czy metody
      //console.log(thisProduct.element);
      const menuContainer = document.querySelector(select.containerOf.menu);
      //console.log(menuContainer);
      menuContainer.appendChild(thisProduct.element); // dodanie stworzonego elementu na strone
    }
    getElements(){
      const thisProduct = this;    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      //console.log(thisProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      //console.log(thisProduct.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      //console.log(this.amountWidgetElem);
      //console.log(thisProduct.imageWrapper);
    }
    initAccordion(){
      const thisProduct = this;
  
      /* find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); //dostęp do nagłówka header
  
      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if(activeProduct !== null && activeProduct !== thisProduct.element){
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
          thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
        
        /* toggle active class on thisProduct.element */
      });
  
    }

    initOrderForm(){
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
  
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
  
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
   
    processOrder() {
      const thisProduct = this;
      //const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);
    
      // set price to default price
      let price = thisProduct.data.price;
    
      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);
    
        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          const option = param.options[optionId];
          //console.log(optionId, option);
        if(optionSelected){
          if(!option.default){
            price += option.price;
          }
          } else{
            if(option.default){
              price -=  option.price;
            }
          }

          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-'+ optionId);
          //console.log(optionImage);
          if(optionImage){
            if(optionSelected){
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else{
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }            

          }
        
        }
      
        }
      // update calculated price in the HTML
      thisProduct.priceSingle = price;
      price *= thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price;
        }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem)

    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;
    

    //app.cart.add(thisProduct);// przekazanie do thisApp.cart.add całego obietku czyli instancji thisProduct
    app.cart.add(thisProduct.prepareCartProduct());// przekazanie do thisApp.cart.add (okrojnej instacji), czyli to co zwróci thisProduct.prepareCartProduct
  }

  prepareCartProduct(){
    const thisProduct = this;
    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      params: thisProduct.prepareCartProductParam()
    };
    return productSummary;
  }

  prepareCartProductParam(){
    const thisProduct = this;
    const  params = {};
    const formData = utils.serializeFormToObject(thisProduct.form);
    for(let paramId in thisProduct.data.params){
      const param = thisProduct.data.params[paramId];
      params[paramId] = {
        label: param.label,
        options:{}
      }
      for(let optionId in param.options){
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        if(optionSelected){
          params[paramId].options[optionId] = option.label;
          //console.log(params);
        }
      }
    }

    
    return params ;  
  }
  
}

  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value || settings.amountWidget.defaultValue);
      thisWidget.initActions();
      //console.log('AmountWidget:', thisWidget);
      //console.log('contructor arguments:', element);

    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
      }

    setValue(value){
      const thisWidget = this;
  
      const newValue = parseInt(value);
  
      // TODO: Add validation
      if((thisWidget.value !== newValue && !isNaN(newValue)) && 
      (value >= settings.amountWidget.defaultMin && value <= settings.amountWidget.defaultMax)){
      thisWidget.value = newValue;
      }
      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();

     
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      })
      thisWidget.linkDecrease.addEventListener('click',function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value -1);
      })
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value +1);
      })

    }

    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated',{
        bubbles: true
      }
        
      );
      thisWidget.element.dispatchEvent(event);
    }
  }

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
      };

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

    
  

  class CartProduct{ // Klasa  odpowiedzialna za funkcjonowanie pojedynczej pozycji w koszyku.
    constructor(menuProduct, element){ //element jest referencja do generatedHtml menuProduct referencją do obiektu podsumowania produktu
      const thisCartProduct = this;
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
      console.log('thisCartProduct:', thisCartProduct);
      
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount; // liczba sztuk wybrana przed dodaniem do koszyka
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;
      


    }

    getElements(element){
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

      


    }

    initAmountWidget(){
      const thisCartProduct = this;
      
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget); // nowa instancja klasy AmountWidget w klasie CartProduct

      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value // zmiana ilości sztuk w koszyku
        thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;

      })
    }

    remove(){
    const thisCartProduct = this;
    console.log(thisCartProduct)

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      }
    });
    thisCartProduct.dom.wrapper.dispatchEvent(event);
    }
    

    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
    });

  }

  getData(){  // tworzenie obiektu z potrzebnymi właściwościami z instancji thisCartProduct, potrzebnymi w momencie zapisywania zamówienia 
    const thisCartProduct = this;

    const productCartSummary = {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      name: thisCartProduct.name,
      params: thisCartProduct.params,
      
    }
    return productCartSummary;
  }
}

  

  

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
}
