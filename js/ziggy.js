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

var Ziggy = function() {

    /* add private vars and functions here */
    var last_action = '';
    
    /* these are widely acessible */
    return {
        
        init: function() {
            $('#service .back').click(Ziggy.show_start)
        },

        test: function () {
            alert('bal');
        },

        build_service_form: function() {
            var service_form = $('<form>').append('<input type="text" name="term" value=""/>');
            service_form.append('<input type="submit" value="go" />');
            service_form.submit(Ziggy.ask_buddy)
            $('#service_form').append(service_form);
        },

        clear_service_view: function() {
            $('#service_result').html('');
            $('#service_form').html('');
        },

        build_service: function() {
            service = this.name;
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
            return false;
        }
    }
}();
