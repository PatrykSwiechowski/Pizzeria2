
class BaseWidget{
    constructor(wrapperElement, initialValue ){ // wrapper w którym znajduje się widget i początkowa wartość widgetu
        const thisWigdet = this;

        thisWigdet.dom = {};
        thisWigdet.dom.wrapper = wrapperElement //zapisujemy wrapper przekazany konstruktorowi w momencie tworzenia instancji

        thisWigdet.correctValue = initialValue; // zapisujemy w właściowi value tego widgetu początkową wartość

    }
    
    get value(){ //GETTER
      const thisWidget = this;

      return thisWidget.correctValue;

    }
    //METODY  PRZENIESIONE Z AMOUNT WIDGET setValue(value), parsedValue(value), isValid(value)
    //PRZENOSIMY TYLKO TE METODY, KTÓRE BĘDA DZIAŁAĆ DLA WSZYSTKICH WIDGETÓW
    set value(value){
        const thisWidget = this;
    
        //const newValue = parseInt(value);
        const newValue = thisWidget.parseValue(value);
    
        // TODO: Add validation
        if(newValue != thisWidget.correctValue /*&& !isNaN(newValue)*/ && thisWidget.isValid(value))
        {
        thisWidget.correctValue = newValue;
        thisWidget.announce();
        }
        //thisWidget.dom.input.value = thisWidget.value;
        thisWidget.renderValue();
  
       
      }

      setValue(value){
        const thisWidget = this;

        thisWidget.value = value;
      }

      parseValue(value){ // metoda będzie wykorzystywana do przekształcenia wartośći, którą chcemu ustawić na odpowiedni typ lub format
        return (value); //to co wpisuje użytkownik jest tesktem wiec parsujemy to na liczby czyli typ danych int (intiger)
      }
  
      isValid(value){ // domyślnie base widget korzysta z liczb więc sprawdzamy w tej metodzie tylko to czy ona nią jest
        return !isNaN(value)
        
  
      }

      renderValue(){
        const thisWidget = this;
  
        thisWidget.dom.input.value = thisWidget.value;
        //thisWidget.dom.wrapper.innerHTML = thisWidget.value // szablon widgetu nie wie czy będzie w nim input, czy nie więc będzie nadpisywał zawartość wrappera tego widgetu
  
      }

      announce(){ // przenosimy tą metode z AmountWidget do BaseWidget, ponieważ nie zawiera informacji specyficznych dla widgetu ilości
        const thisWidget = this;
  
        const event = new CustomEvent('updated',{
          bubbles: true
        }
          
        );
        thisWidget.dom.wrapper.dispatchEvent(event);
        //thisWidget.element.dispatchEvent(event);
      }
}

export default BaseWidget;