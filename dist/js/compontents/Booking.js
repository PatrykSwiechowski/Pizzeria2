import { templates, select } from "../settings.js";
import AmountWidget from "./AmountWidget.js";


class Booking{
    constructor(element){
        const thisBooking = this;

        thisBooking.render(element);
        thisBooking.initWidgets();
    }

    render(element){
        const thisBooking = this;
        const generatedHtml = templates.bookingWidget(); //generowanie kodu HTML za pomocą szablonu templates.bookingWidget, przy czym nie musimy przekazywać do niego żadnych danych, gdyż ten szablon nie oczekuje na żaden placeholder,
        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;
        thisBooking.dom.wrapper.innerHTML = generatedHtml; //zmiana zawartości wrappera (innerHTML) na kod HTML wygenerowany z szablonu
        console.log(thisBooking.dom.wrapper)
        thisBooking.dom.peaopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    }

    initWidgets(){
        const thisBooking = this;

        thisBooking.amountWidget = new AmountWidget(thisBooking.dom.peaopleAmount);

        thisBooking.dom.peaopleAmount.addEventListener('updated', function(){

        });

        thisBooking.amountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
        
        thisBooking.dom.hoursAmount.addEventListener('updated', function(){

        });
    }
}

export default Booking;