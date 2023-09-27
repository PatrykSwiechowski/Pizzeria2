import { select } from "../settings.js";
import AmountWidget from "./AmountWidget.js";

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

export default CartProduct;
