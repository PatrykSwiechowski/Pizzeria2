import { templates, select, settings } from "../settings.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";
import utils from "../utils.js";


class Booking{
    constructor(element){
        const thisBooking = this;

        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.getData();
    }

    //POBIERANIE DANYCH
    getData(){
       const thisBooking = this;
       
       const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate); // w właściowści minDate, znajduje się obiekt daty,a nam jest potrzebna data zapisana jako tekst w odpowiednim formacie do tego użyjemy funkcji dateToStr()
       const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
        
       const params = {
            booking: [
                startDateParam,
                endDateParam,
            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,

            ],
            eventsReapet:[
                settings.db.repeatParam,
                endDateParam,
            ],
        };
        console.log('getData params', params, thisBooking);

        const urls = {
            booking:       settings.db.url + '/' + settings.db.bookings 
                                           + '?' + params.booking.join('&'), // z obiektu params bierzemy właściwość booking która jest tablica i jej elementy mają zostać połączone za pomocą znaku '&'
            eventsCurrent: settings.db.url + '/' + settings.db.events   
                                           + '?' + params.eventsCurrent.join('&'),
            eventsReapet:  settings.db.url + '/' + settings.db.events   
                                           + '?' + params.eventsReapet.join('&'),
        }
        console.log(urls);
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
        thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    }

    initWidgets(){
        const thisBooking = this;

        thisBooking.amountWidget = new AmountWidget(thisBooking.dom.peaopleAmount);

        thisBooking.dom.peaopleAmount.addEventListener('updated', function(){

        });

        thisBooking.amountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
        
        thisBooking.dom.hoursAmount.addEventListener('updated', function(){

        });

        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

        thisBooking.dom.datePicker.addEventListener('updated', function(){

        })

        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.hourPicker.addEventListener('updated', function(){

        })
    }
}

export default Booking;