// Copyright 2009 Martin Borho <martin@borho.net>
// GPL - see License.txt for details

Services = {
        'tlate': {'name':'Translation','active':true,'option_handler':true,'renderer':'tlate'},
        'weather': {'name':'Weather Forecast','active':true,'option':'Language','renderer':'weather'},
        'music': {'name':'Yahoo Music','active':true,'renderer':'music'},
        'gnews': {'name':'Google News','active':true,'option':'Edition','renderer':'google'},
        'gweb': {'name':'Google Search','active':true,'option':'Language','renderer':'yql'},
        'deli': {'name':'Delicious.com','active':true,'checkbox':['pop','Popular'],'renderer':'yql'},
        'metacritic': {'name':'Metacritic.com','active':true,'renderer':'google'},
        'imdb': {'name':'IMDb.com','active':true,'option':'Language','renderer':'google'},
        'wikipedia': {'name':'Wikipedia','active':true,'option':'Language','renderer':'google'},
        'amazon': {'name':'Amazon','active':true,'option':'Language','renderer':'google'},
        'maemo': {'name':'Maemo.org','active':true,'renderer':'google'}
}
api_url = 'http://wavespeaker.appspot.com/api/query?&term=';


var Baas = function() {
    
    return {

        api_call: function(term) {
            console.info(term);
            var request_url = api_url + encodeURIComponent(term)+'&jsoncallback=?';
            $.getJSON(request_url,'{}',
                function(data){
                    Ziggy.render_result(data);
                }
            );             
        }
    }

}();

var ServiceForm = function() {

    return {
        tlate_lang: function (key) {
            var sOptions = ServiceOptions[service+'_'+key];
            var service_options = $('<select name="sOption" id="sOption_'+key+'">');
            if(sOptions) {                
                service_options.append($('<option>').val('').text(key));
                if(key=='from')
                    service_options.append($('<option>').val('').text('Auto'));
                for(o in sOptions) service_options.append($('<option>').val(o).text(sOptions[o]));
            }
            return service_options;
        },

        tlate_form: function() {
            var service_form =  $('<form>').append('<input type="text" id="service_input" name="term" value=""/>');
            service_form.append(ServiceForm.tlate_lang('from'));
            service_form.append(ServiceForm.tlate_lang('to'));
            service_form.append('<input type="submit" value="go" />');
            service_form.submit(Ziggy.ask_buddy)
            return service_form;
        },

        search_form: function(service) {            
            var service_form =  $('<form>').append('<input type="text" id="service_input" name="term" value=""/>');
            var sOptions = ServiceOptions[service];
            if(sOptions) {
                var service_options = $('<select name="sOption" id="sOption">');
                // check for a empty default option
                if(Services[service]['option'] != 'undefined')
                    service_options.append($('<option>').val('').text(Services[service]['option']));
                for(o in sOptions) service_options.append($('<option>').val(o).text(sOptions[o]));
                service_form.append(service_options);
            } else if(Services[service]['checkbox']) {
                var checkbox = $('<input type="checkbox" name="sCheckbox" id="sCheckbox" />').val(Services[service]['checkbox'][0]);
                service_form.append(checkbox);
                service_form.append('<label for="sCheckbox">'+Services[service]['checkbox'][1]+'</span>');
            }                
            service_form.append('<input type="submit" value="go" />');
            service_form.submit(Ziggy.ask_buddy)
            return service_form;
        },

        get: function(service) {
            if(service =='tlate') {
                var service_form = ServiceForm.tlate_form(service);
            } else {
                var service_form = ServiceForm.search_form(service);
            }
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

        build_service_form: function(service) {
            var service_form = ServiceForm.get(service);
            $('#service_form').append(service_form);
        },

        clear_service_view: function() {
            $('#service_result').html('');
            $('#service_form').html('');
        },

        build_service: function() {
            var service = this.name;
            self.service = service;
            $('#services').hide();   
            $('#service .service_name').text(Services[service]['name']);
            Ziggy.build_service_form(service);
            $('#service').fadeIn();
        },
        
        show_start: function() {
            $('#service').hide();
            $('#services').fadeIn();
            Ziggy.clear_service_view();
        },

        build_start: function() {            
            for(s in Services) {
                if(Services[s]['active']) {
                    var link = $('<a name="'+s+'" href="#">'+Services[s]['name']+'</a>').click(Ziggy.build_service);
                    var li = $('<li>').append(link);    
                    $('#services_list').append(li);
                }
            }
        },

        ask_buddy: function() {
            $('#service_result').html('');            
            self.term = Ziggy.build_term();   
            if(self.term != '') {
                Baas.api_call(self.term);
            }
            return false;
        },
        
        option_handler_tlate: function(term) {
            var option = '';
            var sOptionFrom = $('#sOption_from').val();            
            if(sOptionFrom) term += ' @'+sOptionFrom;
            var sOptionTo = $('#sOption_to').val();            
            if(sOptionTo) term += ' #'+sOptionTo;                        
            return term;
        },

        add_options_to_term: function(term) {
            if(Services[self.service]['option_handler'] == true) {                
                term = Ziggy['option_handler_'+self.service](term);
            } else {
                var sOption = $('#sOption').val();            
                if(sOption) {
                    term += ' #'+sOption;
                } else if($('#sCheckbox').attr('checked')) {            
                    term += ' #'+$('#sCheckbox').val();
                }
            }
            return term;
        },

        build_term: function () {            
            var term = self.service+':'+$('#service_input').val();
            term = Ziggy.add_options_to_term(term);
            return term;
        },

        render_tlate: function(data) {
            content = $('<div>');
            content.html('tlate');           
            return content;
        },

        render_weather: function(data) {
            content = $('<div>');
            content.html('weather');           
            return content;
        },

        render_music: function(data) {
            list = $('<ul>');
            for(res in data) {
                list.append($('<li>').html(data[res]['title']));
            }
            return list;
        },

        render_yql: function(data) {
            list = $('<ul>');
            for(res in data) {
                list.append($('<li>').html(data[res]['title']));
            }
            return list;
        },

        render_google: function(data) {
            list = $('<ul>');
            for(res in data) {
                list.append($('<li>').html(data[res]['titleNoFormatting']));
            }
            return list;
        },

        render_result: function(data) {
            console.info(data)
            $('#service_result').append(Ziggy['render_'+Services[self.service]['renderer']](data));
        }

    }
}();
