import { templates, select, settings, classNames } from "../settings.js";
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
        thisBooking.initTables();
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

        //ŁĄCZENIE Z SERVEREM API
        Promise.all([
         fetch(urls.booking),
         fetch(urls.eventsCurrent),
         fetch(urls.eventsReapet),
         ])
         .then(function(allResponses){
            const bookingsResponse = allResponses[0];
            const eventCurrentResponse = allResponses[1];
            const eventReapetResponse = allResponses[2];
         return Promise.all ([
            bookingsResponse.json(),
            eventCurrentResponse.json(),
            eventReapetResponse.json()
        ]);                                           // w tej funkcji zwracamy bookingResponse, a dokładnie wynik jego metody json
         })
                                                       // odpowiedź z servera po przetworzeniu foramtu json na tablice lub obiekt
         .then(function([bookings, eventsCurrent, eventsReapet]){ // zapis ([bookings]) oznacza potraktuj pierwszy element jako tablice i pierwszy element tej tablicy zapisz w ([bookings])
            //console.log(bookings);
            //console.log(eventsCurrent);
            //console.log(eventsReapet);
            thisBooking.parseData(bookings, eventsCurrent, eventsReapet);
         });
    }

    parseData(bookings, eventsCurrent, eventsReapet){
        const thisBooking = this;

        thisBooking.booked = {};

        for(let item of bookings){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table)
        }

        for(let item of eventsCurrent){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table)
        }

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;

        for(let item of eventsReapet){
            if(item.repeat == 'daily'){
                for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){ // pierwszy argument obiekt daty drugi argument liczba dni
                  thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table)
                }
            }
        }

        //console.log('thisBooking.booked', thisBooking.booked);

        thisBooking.updateDOM();
    }

    makeBooked(date, hour, duration, table){
        const thisBooking =  this;

        if(typeof thisBooking.booked[date] == 'undefined'){
            thisBooking.booked[date] = {};
        }

        const startHour = utils.hourToNumber(hour);

        if(typeof thisBooking.booked[date][startHour] == 'undefined'){
            thisBooking.booked[date][startHour] = [];
        }

        thisBooking.booked[date][startHour].push(table);

        for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
        //console.log('loop', hourBlock);

        if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
            thisBooking.booked[date][hourBlock] = [];
        }

        thisBooking.booked[date][hourBlock].push(table);

        }
    }

    updateDOM(){
        const thisBooking = this;

        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvailable = false;

        if(
            typeof thisBooking.booked[thisBooking.date] == 'undefined'
            ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ){
            allAvailable = true;
        }

        for(let table of thisBooking.dom.tables){
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if(!isNaN(tableId)){
                tableId = parseInt(tableId);
            }

            if(
              !allAvailable
              &&
              thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) > -1  
            ){
                table.classList.add(classNames.booking.tableBooked);
            }else{
                table.classList.remove(classNames.booking.tableBooked);
            }

        }
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
        
        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
        thisBooking.dom.floor - thisBooking.dom.wrapper.querySelector(select.booking.floor);
    }

    initTables(){
        const thisBooking = this;
        thisBooking.dom.floor.addEventListener('click', function(event){
            event.preventDefault();
            const target = event.target
            if(target.classList.contains('table')){
                if(!target.classList.contains(classNames.booking.tableBooked)){
                    for(let table of thisBooking.dom.tables){
                        if((table.classList.contains(classNames.booking.selectedTable)) &&
                        (table !== target)){
                            table.classList.remove(classNames.booking.selectedTable)

                        }
                        if(target.classList.contains(classNames.booking.selectedTable)){
                            target.classList.remove(classNames.booking.selectedTable)
                        }else{
                            target.classList.add(classNames.booking.selectedTable);

                        }
        
                    } 
                }

                }

        })

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

        thisBooking.dom.wrapper.addEventListener('updated', function(){
            thisBooking.updateDOM();
        })

       thisBooking.dom.floor.addEventListener('click', function(event){
            thisBooking.initTables(event);
        })
    }
}

export default Booking;