// Copyright 2009 Martin Borho <martin@borho.net>
// GPL - see License.txt for details

Services = {
        'tlate': {'name':'Translation','active':true,'option_handler':true,'renderer':'tlate'},
        'weather': {'name':'Weather Forecast','active':true,'option':'Language','renderer':'weather'},
        'music': {'name':'Yahoo Music','active':true,'renderer':'music'},
        'gnews': {'name':'Google News','active':true,'option':'Edition','renderer':'google'},
        'gweb': {'name':'Google Search','active':true,'option':'Language','renderer':'google'},
        'deli': {'name':'Delicious.com','active':true,'checkbox':['pop','Popular'],'renderer':'yql'},
        'metacritic': {'name':'Metacritic.com','active':true,'renderer':'google'},
        'imdb': {'name':'IMDb.com','active':true,'option':'Language','renderer':'google'},
        'wikipedia': {'name':'Wikipedia','active':true,'option':'Language','renderer':'google'},
        'amazon': {'name':'Amazon','active':true,'option':'Language','renderer':'google'},
        'maemo': {'name':'Maemo.org','active':true,'renderer':'google'}
}
api_url = 'http://ask-ziggy.appspot.com/api/query?&term=';


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
            var service_form =  $('<form id="tlate_form">').append('<textarea id="service_input" style="height:50px;width:99%"></textarea><br/>');
            service_form.append(ServiceForm.tlate_lang('from'));
            service_form.append(ServiceForm.tlate_lang('to'));
            service_form.append('<input type="submit"  id="service_submit" value="go" />');
            service_form.submit(Ziggy.ask_buddy)
            return service_form;
        },

        search_form: function(service) {            
            var service_form =  $('<form id="'+service+'_form">').append('<input type="text" id="service_input" name="term" value=""/><br/>');
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
                var label = $('<label for="sCheckbox">'+Services[service]['checkbox'][1]+'</label>');
                var checker = $('<div id="checker">');
                checker.append(checkbox);
                checker.append(label);
                service_form.append(checker);
            }                
            service_form.append('<input type="submit" id="service_submit" value="go" />');
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

        result_link_hint: function(url) {
            if(url.length > 60)  return url.substring(0,60)+'...';
            else return url
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
            var term = $('#service_input').val();
            term = jQuery.trim(term);
            if (term != '') {
                term = self.service+':'+term;
                term = Ziggy.add_options_to_term(term);
            }
            return term;
        },

        render_tlate: function(data) {
            var content = $('<div id="tlate_res">');            
            content.html('<div id="tlate_text">'+data['text']+'</div><div>('+data['detected_lang']+' => '+data['lang']+')</div>');           
            return content;
        },

        render_weather: function(data) {
            var content = $('<div id="weather_res">');
            content.append('<img src="http://google.com'+data['current']['icon']+'" alt="" class="weather_icon" />');
            content.append('<div>'+data['info']['city']+'</div>');
            if(data['current']['condition'])
                content.append($('<div>'+data['current']['condition']+'</div>'))
            content.append($('<div>'+data['current']['temp_c']+'°C/'+data['current']['temp_f']+'°F</div>'))            
            content.append($('<div>'+data['current']['humidity']+'<br/>'+data['current']['wind_condition']+'</div><br/>'))            
            fore = data['forecast'];
            for(f in fore) {
                var fcast = $('<div class="weather_fcast">');
                fcast.append('<img src="http://google.com'+fore[f]['icon']+'" alt="" />');
                fcast.append('<span>'+fore[f]['day_of_week']+': '+fore[f]['condition']+
                ' ('+fore[f]['low']+'°/'+fore[f]['high']+'°)</span>')
                content.append(fcast);
            }
            return content;
        },

        render_music: function(data) {
            var _extract_hits = function(res) {
                if(res['name']) return [res];
                else return res;
            }
            var _get_artist = function(row) {
                if(row['Artist'][0]) return row['Artist'][0];                
                else return row['Artist'];                
            }
            var list = $('<ul>');
            if(data['Artist']) {
                var artists = _extract_hits(data['Artist']);
                for(a in artists) {
                    var url = decodeURIComponent(artists[a]['url']);
                    var a = $('<a href="'+url+'">'+artists[a]['name']+'</a>');
                    var  li = $('<li>').append(a);
                    var a_hint =  $('<a href="'+url+'" class="a-hint">'+Ziggy.result_link_hint(url)+'</a>');
                    li.append($('<div class="a-hint">').append(a_hint));
                    list.append(li);
                }            
            } else if (data['Release']) {
                var releases = _extract_hits(data['Release']);
                for( r in releases) {
                    var url = decodeURIComponent(releases[r]['url']);
                    var artist = _get_artist(releases[r]);
                    var title = '"'+releases[r]['title']+'" by '+artist['name'];
                    var content = 'Year: '+releases[r]['releaseYear']+'<br/>Label: '+releases[r]['label'];                    
                    var a = $('<a href="'+url+'">'+title+'</a>');
                    var  li = $('<li>').append(a).append('<div>'+content+'</div>');
                    var a_hint =  $('<a href="'+url+'">'+Ziggy.result_link_hint(url)+'</a>');
                    li.append($('<div class="a-hint">').append(a_hint));                                        
                    list.append(li);
                }
            } else if (data['Track']) {
                var tracks = _extract_hits(data['Track']);
                for( t in tracks) {
                    var url = decodeURIComponent(tracks[t]['url']);
                    var artist = _get_artist(tracks[t])
                    var title = '"'+tracks[t]['title']+'" ('+tracks[t]['releaseYear']+') by '+artist['name'];
                    var content = ''
                    try {
                        var album = tracks[t]['Album']['Release'];
                        if(album['title']) content += 'Album: '+album['title'];
                        if(album['label']) content += '<br/>Label: '+ album['label'];
                    } catch(err) {};
                    var a = $('<a href="'+url+'">'+title+'</a>');
                    var  li = $('<li>').append(a)
                    if(content != '') li.append('<div>'+content+'</div>');
                    var a_hint =  $('<a href="'+url+'">'+Ziggy.result_link_hint(url)+'</a>');
                    li.append($('<div class="a-hint">').append(a_hint));                                        
                    list.append(li);
                }
            }
            return list;
        },

        render_yql: function(data) {
            var list = $('<ul>');
            for(res in data) {
                var url = decodeURIComponent(data[res]['link']);
                var a = $('<a href="'+url+'">'+data[res]['title']+'</a>');
                var  li = $('<li>').append(a);
                if(data[res]['content']) li.append($('<div>').html(data[res]['content']));
                var a_hint =  $('<a href="'+url+'">'+Ziggy.result_link_hint(url)+'</a>');
                li.append($('<div class="a-hint">').append(a_hint));
                list.append(li);
            }
            return list;
        },

        render_google: function(data) {
            var list = $('<ul>');
            for(res in data) {
                var url = decodeURIComponent(data[res]['url']);
                var a = $('<a href="'+url+'">'+data[res]['title']+'</a>');
                var  li = $('<li>').append(a);
                li.append($('<div>').html(data[res]['content']));            
                var a_hint =  $('<a href="'+url+'" class="a-hint">'+Ziggy.result_link_hint(url)+'</a>');
                li.append($('<div class="a-hint">').append(a_hint));
                list.append(li);
            }
            return list;
        },

        render_result: function(data) {
            console.info(data)
            if(data['error']) $('#service_result').text(data['error']);
             else $('#service_result').append(Ziggy['render_'+Services[self.service]['renderer']](data));
        }

    }
}();
