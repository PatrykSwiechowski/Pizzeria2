import { select, settings } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{ // dziedziczenie klasy
    constructor(element){
      super(element, settings.amountWidget.defaultValue)  //wywołanie konstruktora klasy nadrzędnej czyli BaseWidget wrapperElemnt = element, intialValue = settings.amountWidget.defaultValue
      const thisWidget = this;
      thisWidget.getElements(/*element*/);
      //thisWidget.setValue(thisWidget.input.value || settings.amountWidget.defaultValue); //usuwamy wyrażenia, która nadawały pierwotną wartość widgetu, ponieważ tym zajmuje się konstruktor klasy nadrzędnej.
      thisWidget.initActions();
      console.log('AmountWidget:', thisWidget);
      //console.log('contructor arguments:', element);

    }

    getElements(/*element*/){
      const thisWidget = this;

      //thisWidget.element = element; // usuwamy elemnt z getElement, ponieważ tym zajmuję się klasa BaseWidget, czyli 
      // Zapisujemy elementy do obiektu z elementami dom
      thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
      thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
      }


    parsedValue(value){ // metoda będzie wykorzystywana do przekształcenia wartośći, którą chcemu ustawić na odpowiedni typ lub format
      return parseInt(value); //to co wpisuje użytkownik jest tesktem wiec parsujemy to na liczby czyli typ danych int (intiger)
    }

    isValid(value){ // nadpisujemy tą metode, aby stworzyć widełki wartości dla widgetu
      return !isNaN(value)
      && value >= settings.amountWidget.defaultMin 
      && value <= settings.amountWidget.defaultMax

    }

    rendervalue(){
      const thisWidget = this;

      thisWidget.dom.input.value = thisWidget.value;

    }

    initActions(){
      const thisWidget = this;

      thisWidget.dom.input.addEventListener('change', function(){
        thisWidget.value = thisWidget.input.value;
      })
      thisWidget.dom.linkDecrease.addEventListener('click',function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value -1);
      })
      thisWidget.dom.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value +1);
      })

    }

  
  }

  export default AmountWidget;