import { select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

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
    //app.cart.add(thisProduct.prepareCartProduct());// przekazanie do thisApp.cart.add (okrojnej instacji), czyli to co zwróci thisProduct.prepareCartProduct

    const event = new CustomEvent('add-to-cart', {
        bubbles: true,
        detail: {
            product: thisProduct.prepareCartProduct(),
        }
    })
    thisProduct.element.dispatchEvent(event);
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

export default Product;