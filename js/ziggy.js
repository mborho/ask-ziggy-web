// Copyright 2009 Martin Borho <martin@borho.net>
// GPL - see License.txt for details

Services = new Object();
Services['tlate'] = 'Translation';
Services['weather'] = 'Weather Forecast';
Services['music'] = 'Yahoo Music';
Services['gnews'] = 'Google News Search';
Services['gweb'] = 'Google Web Search';
Services['deli'] = 'Bookmarks on delicious.com';
Services['metacritic'] = 'Reviews on metacritic.com';
Services['imdb'] = 'Movies on IMDb.com';
Services['wikipedia'] = 'Wikipedia';
Services['amazon'] = 'Amazon';
Services['maemo'] = 'Maemo.org';
api_url = 'http://wavespeaker.appspot.com/api/query?&term=';


var Baas = function() {
    
    return {

        api_call: function(term) {
            var request_url = api_url + encodeURI(term)+'&jsoncallback=?';
            $.getJSON(request_url,'{}',
                function(data){
                    console.info(data);
                }
            );             
        }
    }

}();

var ServiceForm = function() {

    return {
        get: function(service) {
            var service_form =  $('<form>').append('<input type="text" id="service_input" name="term" value=""/>');
            service_form.append('<input type="submit" value="go" />');
            service_form.submit(Ziggy.ask_buddy)
            return service_form;
        }
    }

}();

var Ziggy = function() {

    /* add private vars and functions here */
    var service = '';
    var term = '';

    return {
        
        init: function() {
            $('#service .back').click(Ziggy.show_start)
        },

        test: function () {
            alert('bal');
        },

        build_service_form: function() {
            var service_form = ServiceForm.get(service);
            $('#service_form').append(service_form);
        },

        clear_service_view: function() {
            $('#service_result').html('');
            $('#service_form').html('');
        },

        build_service: function() {
            service = this.name;
            self.service = service;
            $('#services').hide();   
            $('#service .service_name').text(Services[service]);
            Ziggy.build_service_form();
            $('#service').fadeIn();
        },
        
        show_start: function() {
            $('#service').hide();
            $('#services').fadeIn();
            Ziggy.clear_service_view();
        },

        build_start: function() {            
            for(s in Services) {
                var link = $('<a name="'+s+'" href="#">'+Services[s]+'</a>').click(Ziggy.build_service);
                var li = $('<li>').append(link);    
                $('#services_list').append(li);   
            }
        },

        ask_buddy: function() {
            $('#service_result').html('<b>suche jetzt</b>');            
            self.term = Ziggy.build_term();
            Baas.api_call(self.term);
            return false;
        },

        build_term: function () {
            return self.service+':'+$('#service_input').val();
        }
    }
}();
