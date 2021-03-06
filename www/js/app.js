/**
KMRS MOBILE 
Version 2.0
*/

/**
Default variable declarations 
*/
var ajax_url= krms_config.ApiUrl ;
var dialog_title_default= krms_config.DialogDefaultTitle;
var search_address;
var ajax_request;
var cart=[];
var networkState;

var easy_category_list='';
var map;
var map_search;
var drag_marker;
var map_track;
var track_order_interval;
var track_order_map_interval;
var drag_marker_bounce=1;
var versao_aplicativo;
var versao_aplicativo_code;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() { 

var notificationOpenedCallback = function(jsonData) {
    console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
  };

  	window.plugins.OneSignal
    .startInit("051de2f8-72c7-4fac-a742-45f7027aac40")
    .handleNotificationOpened(notificationOpenedCallback)
    .endInit();
	    					
	navigator.splashscreen.hide();
	
	if(!isDebug()){
 	   getLanguageSettings();
	}
				
	if ( !empty(krms_config.pushNotificationSenderid)) {
					
	    var push = PushNotification.init({
	        "android": {
	            "senderID": krms_config.pushNotificationSenderid
	        },
	        "ios": {"alert": "true", "badge": "true", "sound": "true", "clearBadge": "true" }, 
	        "windows": {} 
	    });
	    
	    push.on('registration', function(data) {         

	    	setStorage("device_id", data.registrationId );
	    	     
	        /*var params="registrationId="+ data.registrationId;
	            params+="&device_platform="+device.platform;
		        params+="&client_token="+getStorage("client_token");
		        callAjax("registerMobile",params);*/
	    });
	    
	    push.on('notification', function(data) {	    	
	        //alert(JSON.stringify(data));           
	        if ( data.additionalData.foreground ){	        
	        	//alert("when the app is active");
	        	
	        	playNotification();
	        	
	        	if ( data.additionalData.additionalData.push_type=="order"){
	        		showNotification( data.title,data.message );
	        	} else {
	        		showNotificationCampaign( data.title,data.message  );
	        	}
	        } else {
	        	//alert("when the app is not active");
	        	if ( data.additionalData.additionalData.push_type=="order"){
	        		showNotification( data.title,data.message );
	        	} else {
	        		showNotificationCampaign( data.title,data.message  );
	        	}
	        }	 
	        /*push.finish(function () {
	            alert('finish successfully called');
	        }); */      	        
	    });
	
	    push.on('error', function(e) {
	        //onsenAlert("push error");
	    });    
	   	    	   		
		push.finish(function () {
	        //alert('finish successfully called');
	    }); 
	        
	}
}

/*document.addEventListener("offline", onOffline, false);
function onOffline() {    	
    $(".home-page").hide();
    $(".no-connection").show();		
}

document.addEventListener("online", onOnline, false);
function onOnline()
{
	$(".home-page").show();
    $(".no-connection").hide();		
}*/

document.addEventListener("offline", noNetConnection, false);

function noNetConnection()
{
	toastMsg( getTrans("Internet connection lost","net_connection_lost") );
}


jQuery.fn.exists = function(){return this.length>0;}

function dump(data)
{
	console.debug(data);
}

function setStorage(key,value)
{
	localStorage.setItem(key,value);
}

function getStorage(key)
{
	return localStorage.getItem(key);
}

function removeStorage(key)
{
	localStorage.removeItem(key);
}

function explode(sep,string)
{
	var res=string.split(sep);
	return res;
}

function urlencode(data)
{
	return encodeURIComponent(data);
}

$( document ).on( "keyup", ".numeric_only", function() {
  this.value = this.value.replace(/[^0-9\.]/g,'');
});	 

ons.bootstrap();  
ons.ready(function() {
	dump('ready');
	
		/*Atualização Master Hub (Atualiza Versão do Android)*/
if(!isDebug()){
			var versao = getStorage('versao');
			var versaoCode = getStorage('versaoCode');
			var ver_aplicativo = getStorage('versao_aplicativo');
			var ver_aplicativo_code = getStorage('versao_aplicativo_code');
		   	versao_aplicativo = getStorage("versao_aplicativo");
	       	dump("versao_aplicativo=>"+versao_aplicativo);
		   	versao_aplicativo_code = getStorage("versao_aplicativo_code");
		   	dump("versao_aplicativo_code=>"+versao_aplicativo_code);
	if(typeof versao_aplicativo===getStorage("versao") || versao_aplicativo_code===getStorage("versaoCode")){
	       } else {
		var forcar_atualizar = getStorage("forcar_atualizar");
	    dump("forcar_atualizar=>"+forcar_atualizar);
		if(forcar_atualizar==='yes'){
	       	  ons.createAlertDialog('alerta-atualizacao-forcada.html').then(function(alertDialog) {
    			alertDialog.show();
  				});
		   } else {
	       	  ons.createAlertDialog('alerta-atualizacao.html').then(function(alertDialog) {
    			alertDialog.show();
  				});
		}
		   
	}
		   
}
	/*Fim da Atualização*/
		
	if(isDebug()){
		removeStorage("search_address");		
	}
		
	//navigator.splashscreen.hide()	
	$("#s").val( getStorage("search_address") );
		
	refreshConnection();
	
	//removeStorage("client_token");
	
	if(isDebug()){
	   setStorage("device_id","device_12345");
	}
				
	//getLanguageSettings();
	if(isDebug()){
 	   setTimeout('getLanguageSettings()', 1100);
	}
	
	$( document ).on( "click", "#s", function() {    	     	    	   
	   $("#s").val('');
	});
	
}); /*end ready*/

function refreshConnection()
{	
	if ( !hasConnection() ){
		$(".home-page").hide();
		$(".no-connection").show();		
	} else {
		$(".home-page").show();
		$(".no-connection").hide();
	}	
}

function hasConnection()
{
	if(isDebug()){
		return true;
	}
	//networkState = navigator.network.connection.type;		
	var networkState = navigator.connection.type;	
	if ( networkState=="Connection.NONE" || networkState=="none"){	
		return false;
	}	
	return true;
}

function geoComplete()
{
	dump( "country_code_set=>" + getStorage("country_code_set"));
			
	if ( empty(getStorage("country_code_set")) ){				
		if(empty(getStorage("mobile_country_code"))){
		  $("#s").geocomplete();		
		} else {
		  $("#s").geocomplete({
		    country: getStorage("mobile_country_code")
	      });			 
	           
	      setStorage("country_code_set", getStorage("mobile_country_code") );
	      
		}				
	} else {				
		$("#s").geocomplete({
		   country: getStorage("country_code_set")
	    });	
	}
}

function createElement(elementId,elementvalue)
{
   var content = document.getElementById(elementId);
   content.innerHTML=elementvalue;
   ons.compile(content);
}

function searchMerchant()
{			
		
  var s = $('#s').val();  
  
  /*clear all storage*/
  setStorage("search_address",s);   
  removeStorage('merchant_id');
  removeStorage('shipping_address');  
  removeStorage('merchant_id');
  removeStorage('transaction_type');
  removeStorage('merchant_logo');
  removeStorage('order_total');
  removeStorage('merchant_name');
  removeStorage('total_w_tax');
  removeStorage('currency_code');
  removeStorage('paymet_desc');
  removeStorage('order_id');   
  removeStorage('order_total_raw');   
  removeStorage('cart_currency_symbol');     
  removeStorage('paypal_card_fee');   
  
  removeStorage('cart_sub_total');
  removeStorage('cart_delivery_charges');
  removeStorage('cart_packaging');
  removeStorage('cart_tax');
  removeStorage('map_address_result_formatted_address');
  removeStorage("customer_contact_number");
  
  if(s!=""){
	  var options = {     
	  	  address:s,	  	 	  	  
	  	  closeMenu:true,
	      animation: 'slide'	      
	   };	   	   	 
	  menu.setMainPage('searchResults.html',options);
	  	  
  } else{
  	 onsenAlert(   getTrans('Address is required','address_is_required')  );
  }
}

function searchCategorias()
{			
		
  var s = $('#s').val();
  
  /*clear all storage*/
  setStorage("search_address",s);
  removeStorage('merchant_name');   
  removeStorage('merchant_id');
  removeStorage('shipping_address');  
  removeStorage('merchant_id');
  removeStorage('transaction_type');
  removeStorage('merchant_logo');
  removeStorage('order_total');
  removeStorage('total_w_tax');
  removeStorage('currency_code');
  removeStorage('paymet_desc');
  removeStorage('order_id');   
  removeStorage('order_total_raw');   
  removeStorage('cart_currency_symbol');     
  removeStorage('paypal_card_fee');   
  
  removeStorage('cart_sub_total');
  removeStorage('cart_delivery_charges');
  removeStorage('cart_packaging');
  removeStorage('cart_tax');
  removeStorage('map_address_result_formatted_address');
  removeStorage("customer_contact_number");
  
  if(s!=""){
	  var options = {     
	  	  address:s,	  	 	  	  
	  	  closeMenu:true,
	      animation: 'slide'	      
	   };	   	   	 
	  menu.setMainPage('searchCategorias.html',options);
	  	  
  } else{
  	 onsenAlert(   getTrans('Address is required','address_is_required')  );
  }
}

/*ons.ready(function() {
  kNavigator.on('prepush', function(event) {  	
  	 dump("prepush");   
  });
});*/

document.addEventListener("pageinit", function(e) {
	dump("pageinit");	
	dump("pagname => "+e.target.id);

	/*Atualização Master Hub (Oculta Categorias e Mostra um Botão)*/
		   var busca_categoria = getStorage("busca_categoria");
	       dump("busca_categoria=>"+busca_categoria);
	       if(busca_categoria!='yes'){
	       	  $(".busca-categoria").hide();
			  $(".busca-categoria-logo").hide();
			  $(".botao-busca").css({"display":"block"});
			  $(".busca-categoria-logotop").css({"display":"block"});
	       } else {
			  $(".botao-busca").hide();
	       	  
	       }
	/*Fim da Atualização*/
			
	switch (e.target.id)
	{		
		case "page-getsettings":
		  //getLanguageSettings();
		  break;
		
		case "menucategory-page":
		case "page-merchantinfo":		
		case "page-reviews":
		case "page-cart":		
		case "page-receipt":				
		case "page-change-address":		
		case "page-order-options":
		case "page-track-order":
		case "page-map":		
		case "tracking-page":
		  translatePage();
		  break;
		  
		case "address-bymap":
		  translatePage();
		  $(".search_address_geo").attr("placeholder",  getTrans('Street Address,City,State','home_search_placeholder') );
		  break;
		   
		case "page-enter-contact":  
		  translatePage();
		  $(".contact_phone").attr("placeholder", getTrans("Mobile Phone","mobile_number") );
		  translateValidationForm();
		  break;
		  
		case "page-booking":  
		  translatePage();
		  $(".number_guest").attr("placeholder", getTrans("Number Of Guests","number_of_guest") );		  
		  initIntelInputs();
		  break;
		  
	   case "page-paymentoption":
	     translatePage();
	     $(".order_change").attr("placeholder", getTrans('change? For how much?','order_change') );	     
	     $(".cpf_nota").attr("placeholder", getTrans('CPF na Nota','cpf_nota') );
    
		 break;
		 
	  case "page-addressbook-details":
	    translatePage();
	    translateValidationForm();
	    
	    $(".street").attr("placeholder",  getTrans("Street",'street') );
	    $(".city").attr("placeholder",  getTrans("City",'city') );
	    $(".state").attr("placeholder",  getTrans("State",'state') );
	    $(".zipcode").attr("placeholder",  getTrans("Postal code/Zip Code",'zipcode') );
	    $(".location_name").attr("placeholder",  getTrans("Location name",'location_name') );
	    
	    break;
	    
	   case "page-signup":		 
	     translatePage();
	     translateValidationForm();
	     $(".first_name").attr("placeholder",  getTrans("First Name",'first_name') );
	     $(".last_name").attr("placeholder",  getTrans('Last Name','last_name') );
	     $(".contact_phone").attr("placeholder",  getTrans('Mobile Phone','contact_phone') );
	     $(".email_address").attr("placeholder",  getTrans('Email address','email_address') );
	     $(".password").attr("placeholder",  getTrans('Password','password') );
	     $(".cpassword").attr("placeholder",  getTrans('Confirm Password','confirm_password') );	     
	     
	     break;
	     
	   case "page-checkoutsignup": 
	     translatePage();
         translateValidationForm();
         
         $(".first_name").attr("placeholder",  getTrans("First Name",'first_name') );
	     $(".last_name").attr("placeholder",  getTrans('Last Name','last_name') );
	     $(".contact_phone").attr("placeholder",  getTrans('Mobile Phone','contact_phone') );
	     $(".email_address").attr("placeholder",  getTrans('Email address','email_address') );
	     $(".password").attr("placeholder",  getTrans('Password','password') );
	     $(".cpassword").attr("placeholder",  getTrans('Confirm Password','confirm_password') );	
	     break;
		  
	   case "page-shipping":	  
	   
	      $(".street").attr("placeholder", getTrans('Street','street') );
	      $(".city").attr("placeholder", getTrans('City','city') );
	      $(".state").attr("placeholder", getTrans('State','state') );
	      $(".zipcode").attr("placeholder", getTrans('Postal code/Zip Code','zipcode') );
	      $(".contact_phone").attr("placeholder", getTrans('Contact phone','contact_phone') );
	      $(".location_name").attr("placeholder", getTrans('Apartment suite, unit number, or company name','location_name2') );
	      $(".delivery_instruction").attr("placeholder", getTrans('Delivery instructions','delivery_instruction') );
	   
	      translatePage();
	      translateValidationForm();
	      	      
	      //$('.zipcode').mask("00000-000", {placeholder: "_____-___"});
	      
	      initIntelInputs();
	      
	      var customer_contact_number=getStorage("customer_contact_number");
	      if(!empty(customer_contact_number)){
	      	  $(".contact_phone").val( customer_contact_number );
	      }
	      
	      break;
		
		case "searchresult-page":	
		$("#search-text2").html( getStorage("search_address") );
		callAjax("search","address="+ getStorage("search_address") );	
								
		break;
		
		case "searchcategorias-page":	
		
		var cuisine_type='';
		
		$("#search-text2").html( getStorage("search_address") );
		callAjax("search","address="+ getStorage("search_address")+"&cuisine_type="+cuisine_type+
		"&restaurant_name="+ restaurant_name);
		break;
		
		case "page-home":							
			geoComplete();
			
			search_address=getStorage("search_address");
			
			if (typeof search_address === "undefined" || search_address==null || search_address=="" ) { 
			} else {												
				setTimeout('$("#s").val(search_address)', 100);
			}
			translatePage();		
			
			$("#s").attr("placeholder",  getTrans('Street Address,City,State','home_search_placeholder') );
		  	
			// Banner Frente vindo do Admin
	var codigo_do_banner = getStorage("codigo_do_banner");
	createElement('codigo-banner-frente',codigo_do_banner);	

			// Busca por Categoria - vindo do Admin
	var codigo_da_busca = getStorage("codigo_da_busca");
	createElement('codigo-busca',codigo_da_busca);

			// Busca por Seguimento vindo do Admin
	var codigo_dos_seguimentos = getStorage("codigo_dos_seguimentos");
	createElement('codigo-seguimentos',codigo_dos_seguimentos);	
	
			// Ofertas vindo do Admin
	var codigo_das_ofertas = getStorage("codigo_das_ofertas");
	createElement('codigo-ofertas',codigo_das_ofertas);	

			// Nossa Missão vindo do Admin
	var codigo_nossa_missao = getStorage("codigo_nossa_missao");
	createElement('codigo-nossa-missao',codigo_nossa_missao);	

			// Trabalhe Conosco vindo do Admin
	var codigo_trabalhe_conosco = getStorage("codigo_trabalhe_conosco");
	createElement('codigo-trabalhe-conosco',codigo_trabalhe_conosco);	

			// Menu Rodapé vindo do Admin
	var codigo_menu_rodape = getStorage("codigo_menu_rodape");
	createElement('codigo-menu-rodape',codigo_menu_rodape);	

		break;
		
		case "page-filter-options":
		  callAjax('cuisineList','');
		  break;
		  
		case "page-filter-seguimentos":
		  callAjax('seguimentosList','');
		  break;
		
		case "page-browse":
		  callAjax('browseRestaurant','');
		  translatePage();
		  break;

		  case "page-sharetheapp":
		
		  break;
		  
		  /*Atualização Master Hub (Atualização do aplicativo e Página Personalizada)*/
		  case "page-atualizar":
		  
		var versao = getStorage('versao');
		var versaoCode = getStorage('versaoCode');
		var ver_aplicativo = getStorage('versao_aplicativo');
		var ver_aplicativo_code = getStorage('versao_aplicativo_code');
		
		var htm='';
		
		if(!isDebug()){
		   versao_aplicativo = getStorage("versao_aplicativo");
	       dump("versao_aplicativo=>"+versao_aplicativo);
		   versao_aplicativo_code = getStorage("versao_aplicativo_code");
		   dump("versao_aplicativo_code=>"+versao_aplicativo_code);
	       if(typeof versao_aplicativo===getStorage("versao") || versao_aplicativo_code===getStorage("versaoCode")){

		htm+='<h4 style="text-align: center;" class="trn" data-trn-key="acabei_de_atualizar_o_aplicativo">';
		htm+='Você já atualizou para a versão mais recente!';
		htm+='</h4>';

	       } else {
			   
		htm+='<h4 style="text-align: center;" class="trn" data-trn-key="atualizamos_para_melhor">';
		htm+='Atualizamos para um melhor funcionamento!';
		htm+='</h4>';
		htm+='<p class="trn" style="text-align: center;" data-trn-key="clique_abaixo_para_atualizar">';
		htm+='Clique no botão abaixo para fazer a atualização do aplicativo direto da Google Play!';
		htm+='</p>';
		htm+='<button class="btnz whats" onClick="AtualizarApp()" >';
		htm+='<i class="fa fa-download fa-2x"></i>';
		htm+='<span class="trn" data-trn-key="btn_atualizar">  Atualizar</span>';
		htm+='</button>';
		
	       }
		}
		
		
		htm+='<p style="text-align: center;" class="trn" data-trn-key="sua_versao_instalada"> Versão Instalada no seu aparelho </p>';
		htm+='<h4 style="text-align: center">';
		htm+=versao+' - ('+versaoCode+')';
		htm+='</h4>';
		htm+='<br>';
		htm+='<p style="text-align: center;" class="trn" data-trn-key="versao_da_atualizacao">';
		htm+=' Versão Atualizada';
		htm+='</p>';
		htm+='<h4 style="text-align: center">';
		htm+=ver_aplicativo+' - ('+ver_aplicativo_code+')';
		htm+='</h4>';
		
	       if(typeof versao_aplicativo===getStorage("versao") || versao_aplicativo_code===getStorage("versaoCode")){
		
		htm+='<button class="btnz whats" onClick="setHome();" >';
		htm+='<i class="fa fa-thumbs-up fa-2x"></i>';
		htm+='<span class="trn" data-trn-key="btn_atualizou">  Acabei de Atualizar</span>';
		htm+='</button>';
		
		   } else {
			   
		   }
		
		createElement('versao-instalada',htm);	
		translatePage();
		
		  break;
		  
		  case "showHome-help":
		  
		  break;
		   /*Fim da atualização*/
		   
		case "page-profile":
		  callAjax('getProfile',
		  "client_token="+getStorage("client_token")
		  );
		  translatePage();
		  translateValidationForm();
		  
		  $(".first_name").attr("placeholder",  getTrans('First Name','first_name') );
		  $(".last_name").attr("placeholder",  getTrans('Last Name','last_name') );
		  $(".email_address").attr("placeholder",  getTrans("Email Address",'email_address') );
		  $(".password").attr("placeholder",  getTrans("Password",'password') );
		  
		  break;
		
		case "page-orders":  
		  callAjax('getOrderHistory',
		  "client_token="+getStorage("client_token")
		  );
		  translatePage();
		  break;
		  
		case "page-addressbook": 
		  callAjax('getAddressBook',
		  "client_token="+getStorage("client_token")
		  );
		  translatePage();
		  break;
		  
		case "page-dialog-addressbook":  
		  callAjax('getAddressBookDialog',
		  "client_token="+getStorage("client_token")
		  );
		  break;
		  
		case "page-login":  
		case "page-prelogin":  
		  initFacebook();
		  translatePage();
		  translateValidationForm();

		  $(".email_address").attr("placeholder",  getTrans('Email address','email_address') );
		  $(".password").attr("placeholder",  getTrans('Password','password') );
		  	  
		  break;
		  		  		  
		case "page-settings":  
		
		   if (isDebug()){
		    	$(".software_version").html( "2.0 - Debug" );
		    } else {
		    	$(".software_version").html( getStorage("versao")+" - ("+getStorage("versaoCode")+")");
		    }
		
		  callAjax("getSettings",
		  "device_id="+getStorage("device_id")
		  ); 
		  translatePage();
		  break;
		  
		case "page-locations":  
		  callAjax('mobileCountryList',
		  "device_id="+getStorage("device_id")
		  );
		  break;
		  
		case "page-languageoptions":  
		  callAjax('getLanguageSelection','');
		  break;
		  
		case "page-expirationmonth": 
		  fillExpirationMonth();
		  break;	
		  
		case "page-expiration-year": 
		  fillExpirationYear();
		  break;  	  
		  
		case "page-show-country":  
		   fillCountryList();
		   break;  	  
		  		
		   
		case "page-pts":   
		  dump('page-pts');
		   callAjax('getPTS',
		    "client_token="+getStorage("client_token")
		   );
		   translatePage();
		   break; 
		
		case "page-atz-form":
		   translatePage();
	       translateValidationForm();	    
	       
	       $(".cc_number").attr("placeholder",  getTrans("Credit Card Number",'cc_number') );
	       $(".cvv").attr("placeholder",  getTrans("CVV",'cvv') );
	       $(".x_first_name").attr("placeholder",  getTrans("First Name",'first_name') );
	       $(".x_last_name").attr("placeholder",  getTrans("Last Name",'last_name') );
	       $(".x_address").attr("placeholder",  getTrans("Address",'address') );
	       $(".x_city").attr("placeholder",  getTrans("City",'city') );
	       $(".x_state").attr("placeholder",  getTrans("State",'state') );
	       $(".x_zip").attr("placeholder",  getTrans("Postal code/Zip Code",'zipcode') );
	       
		   break; 
		   
		case "page-stripe-form":   
		   translatePage();
	       translateValidationForm();  
	       
	       $(".cc_number").attr("placeholder",  getTrans("Credit Card Number",'cc_number') );
	       $(".cvv").attr("placeholder",  getTrans("CVV",'cvv') );
	       
		   break; 
		   
		   
		case "page-verify-account":   
		  $(".code").attr("placeholder",  getTrans("Code",'code') );
		  $(".email_address").attr("placeholder",  getTrans("Email Address",'email_address') );
		  translatePage();
		  translateValidationForm();
		 break;
		 
		case "page-address-selection":
           translatePage();
		   translateValidationForm();
		   $(".stree_1").attr("placeholder",  getTrans("Street",'street') );
	       $(".city_1").attr("placeholder",  getTrans("City",'city') );
	       $(".state_1").attr("placeholder",  getTrans("State",'state') );
	       $(".zipcode_1").attr("placeholder",  getTrans("Postal code/Zip Code",'zipcode') );	      		
		  break;
		   
		default:
		  break;
	}
    
}, false);

function searchResultCallBack(address)
{
	search_address=address;	
}

function showSeguimentos()
{	
	if (typeof navDialog === "undefined" || navDialog==null || navDialog=="" ) { 	    
		ons.createDialog('filterSeguimentos.html').then(function(dialog) {
	        dialog.show();
	        translatePage();
	    });	
	} else {
		navDialog.show();
		//translatePage();
	}	
}

function applyFilterSeguimentos()
{
	navDialog.hide();
	
	var services='';
	if (  $(".delivery_type").exists()){
		$.each( $(".delivery_type:checked") , function( key, val ) { 			
			//services+= $(this).val() +",";
			services+= $(this).val();
		});			
	}
	
	dump("services=>"+services);
	var cuisine_type='';
	if (  $(".cuisine_type").exists()){
		$.each( $(".cuisine_type:checked") , function( key, val ) { 			
			cuisine_type+= $(this).val() +",";
		});		
	}
	dump("cuisine_type=>"+cuisine_type);
	callAjax("search","address="+ getStorage("search_address") +"&services=" + services + 
	"&cuisine_type="+cuisine_type + "&restaurant_name="+ $(".restaurant_name").val() );
}

function applyFilterCancela()
{
	navDialog.hide();
	
	var services='';

	var cuisine_type='';
	
	var restaurant_name='';

	callAjax("search","address="+ getStorage("search_address") +"&services=" + services + 
	"&cuisine_type="+cuisine_type + "&restaurant_name=" + restaurant_name);
}

function showFilterOptions()
{	
	if (typeof navDialog === "undefined" || navDialog==null || navDialog=="" ) { 	    
		ons.createDialog('filterOptons.html').then(function(dialog) {
	        dialog.show();
	        translatePage();
	    });	
	} else {
		navDialog.show();
		//translatePage();
	}	
}

function applyFilter()
{
	navDialog.hide();
	
	var services='';
	if (  $(".delivery_type").exists()){
		$.each( $(".delivery_type:checked") , function( key, val ) { 			
			//services+= $(this).val() +",";
			services+= $(this).val();
		});			
	}
	
	dump("services=>"+services);
	var cuisine_type='';
	if (  $(".cuisine_type").exists()){
		$.each( $(".cuisine_type:checked") , function( key, val ) { 			
			cuisine_type+= $(this).val() +",";
		});		
	}
	dump("cuisine_type=>"+cuisine_type);
	callAjax("search","address="+ getStorage("search_address") +"&services=" + services + 
	"&cuisine_type="+cuisine_type + "&restaurant_name="+ $(".restaurant_name").val() );
}

function onsenAlert(message,dialog_title)
{
	if (typeof dialog_title === "undefined" || dialog_title==null || dialog_title=="" ) { 
		dialog_title=dialog_title_default;
	}
	
	if(empty(message)){
		message='undefined error';
	}
	
	ons.notification.alert({
      message: message,
      title:dialog_title
    });
}

function hideAllModal()
{
	setTimeout('loaderSearch.hide()', 1);
	setTimeout('loader.hide()', 1);
	setTimeout('loaderLang.hide()', 1);
}

function fechar_prop()
  {
 setHome();
  }

/*mycallajax*/
function callAjax(action,params)
{
	
	if ( !hasConnection() ){		
		switch (action)
		{
			case "registerMobile":			
			break;
			
			case "getLanguageSettings":
			  $(".retry-language").show();
			break;
			
			default:
			toastMsg(  getTrans("CONNECTION LOST",'connection_lost') );
			break;
			
		}
		return;
	}
	
	dump("action=>"+action);
	
	/*add language use parameters*/
	params+="&lang_id="+getStorage("default_lang");
	params+="&lang="+getStorage("default_lang");
	if(!empty(krms_config.APIHasKey)){
		params+="&api_key="+krms_config.APIHasKey;
	}
	
	dump(ajax_url+"/"+action+"?"+params);
	
    ajax_request = $.ajax({
		url: ajax_url+"/"+action, 
		data: params,
		type: 'post',                  
		async: false,
		dataType: 'jsonp',
		timeout: 6000,
		crossDomain: true,
	 beforeSend: function() {
		if(ajax_request != null) {			 	
		   /*abort ajax*/
		   hideAllModal();	
           ajax_request.abort();
		} else {    
			/*show modal*/			   
			switch(action)
			{
				case "registerMobile":
				   break;
				case "search":
				   loaderSearch.show();
				   translatePage();
				   break;
			    case "getLanguageSettings":			    
			       loaderLang.show();
			       break;
				default:
				   loader.show();
				   break;
			}
		}
	},
	complete: function(data) {					
		ajax_request=null;   	     				
		hideAllModal();		
	},
	success: function (data) {	  
		dump(data); 		
		if (data.code==1){
			switch (action)
			{
				case "search":				
				displayRestaurantResults(data.details.data ,'restaurant-results');
				//$(".result-msg").text(data.details.total+" Restaurant found");
				$(".result-msg").text(data.details.total+" "+getTrans("Restaurant found",'restaurant_found') );
								
				break;
				
				case "MenuCategory":			
				/*save merchant logo*/								
				setStorage("merchant_logo",data.details.logo);
				dump(data.details.restaurant_name);
				setStorage("merchant_name",data.details.restaurant_name);
				
				setStorage("enabled_table_booking",data.details.enabled_table_booking);
				
				setStorage("merchant_latitude",data.details.coordinates.latitude);
				setStorage("merchant_longtitude",data.details.coordinates.longtitude);
				setStorage("merchant_address",data.details.address);
				
				removeStorage("transaction_type");				
				setStorage("merchant_services",data.details.service);
				
				menuCategoryResult(data.details);
				break;
				
				case "cuisineList":
				cuisineResults(data.details);
				break;
				
				case "seguimentosList":
				seguimentosResults(data.details);
				break;

								
				case "getItemByCategory":			
				easy_category_list='';						
				displayItemByCategory(data.details);
				fillPopOverCategoryList(data.details.category_list);
				break;
				
				case "getItemDetails":
				displayItem(data.details);
				break;
				
				case "loadCart":
				$("#page-cart .wrapper").show();				
				$(".checkout-footer").show();
				$("#page-cart .frm-cart").show();
				
				/*tips*/
				if ( data.details.enabled_tip==2){
					$(".tip_amount_wrap").show();	
					setStorage("tips_percentage", data.details.tip_default );
				} else {
					$(".tip_amount_wrap").hide();
				}
												
				displayCart(data.details);
				
				if (!empty(data.details.cart.discount)){
					setStorage("has_discount",1);
				} else {
					removeStorage("has_discount");
				}
				
				if (typeof addressDialog === "undefined" || addressDialog==null || addressDialog=="" ) {
				} else {					
					if ( addressDialog.isShown()){						
						addressDialog.hide();
					}				
				}
				
				/*HIDE CHANGES ADDRESS FUNCTIONS*/
				if ( data.details.transaction_type=="delivery"){
					$(".change_address_wrap").show();
				} else {
					$(".change_address_wrap").hide();
				}			
				
				break;
														
				case "checkout":		
								
				    if ( data.details=="shipping"){				    	
				    	var options = {
					      animation: 'slide',
					      onTransitionEnd: function() { 						      	  
					      	  displayMerchantLogo2( getStorage("merchant_logo") ,
					      	     getStorage("order_total") ,
					      	     'page-shipping');
					      	     
					      	  /*if (data.msg.length>0){
					      	  	  $(".select-addressbook").css({"display":"block"});
					      	  } else $(".select-addressbook").hide();*/
					      	  
					      	  if(!empty(data.msg.profile)){
					      	  	  $(".contact_phone").val( data.msg.profile.contact_phone ) ;
					      	  	  $(".location_name").val( data.msg.profile.location_name ) ;
					      	  }
					      	  
					      	  if ( !empty( getStorage("map_address_result_formatted_address") )){
					      	  	    $(".delivery-address-text").html( getStorage("map_address_result_formatted_address") );
								    $(".street").val( getStorage("map_address_result_address") );
								    $(".city").val( getStorage("map_address_result_city") );
								    $(".state").val( getStorage("map_address_result_state") );
								    $(".zipcode").val( getStorage("map_address_result_zip") );	
								    $(".formatted_address").val( getStorage("map_address_result_formatted_address") );	
								 
								    $(".google_lat").val( getStorage("google_lat") );	
								    $(".google_lng").val( getStorage("google_lng") );	
					      	  } else {
					      	  	  if(!empty(data.msg.address_book)){
					      	  	  	  $(".street").val( data.msg.address_book.street );
									  $(".city").val( data.msg.address_book.city );
									  $(".state").val( data.msg.address_book.state );
									  $(".zipcode").val( data.msg.address_book.zipcode );
									  $(".location_name").val( data.msg.address_book.location_name );	
									  
									  
									  var complete_address = data.msg.address_book.street;
									  complete_address+=" "+ data.msg.address_book.city;
									  complete_address+=" "+ data.msg.address_book.state;
									  complete_address+=" "+ data.msg.address_book.zipcode;
									
									  $(".delivery-address-text").html( complete_address ); 
									  $(".formatted_address").val( complete_address );	
					      	  	  }
					      	  }
					      	  					      	      	  
					      } /*end transition*/
					    };     
					    sNavigator.pushPage("shipping.html", options);				
					    		
				    } else if ( data.details =="payment_method") {
				    	
				    	/*alert(data.msg.transaction_type);
				    	alert(data.msg.show_mobile_number);*/
				    	
					    var options = {
					      animation: 'slide',
					      onTransitionEnd: function() { 						      	  
					      	  displayMerchantLogo2( 
					      	     getStorage("merchant_logo") ,
					      	     getStorage("order_total") ,
					      	     'page-paymentoption'
					      	  );
					      	  
					      	  var params="merchant_id="+ getStorage("merchant_id");
					      	  params+="&client_token="+ getStorage("client_token");
					      	  params+="&transaction_type=" + $(".transaction_type:checked").val();
					      	  callAjax("getPaymentOptions",params);
					      } 
					    };   
					    sNavigator.pushPage("paymentOption.html", options);		       
				    	
				    } else if ( data.details =="enter_contact_number") {
				    	 
				    	var options = {
					      animation: 'slide',
					      onTransitionEnd: function() { 	
					      	  initIntelInputs();					      	  					      	  
					      } 
					    };   
					    sNavigator.pushPage("enterContact.html", options);		
				    	 
				    } else {
						var options = {
					      animation: 'slide',
					      onTransitionEnd: function() { 	
					      	  dump( getStorage("merchant_logo") );	      	  
					      	  dump( getStorage("order_total") );
					      	  displayMerchantLogo2( getStorage("merchant_logo") ,
					      	     getStorage("order_total") ,
					      	     'page-checkoutsignup');
					      	     
					      	  callAjax("getCustomFields",'');     
					      	  initIntelInputs();      
					      } 
					    };     
					    sNavigator.pushPage("checkoutSignup.html", options);				
				    }
				break;
				
				case "signup":
				    setStorage("client_token", data.details.token ); // register token
				    
				    setStorage("avatar",data.details.avatar);
                    setStorage("client_name_cookie",data.details.client_name_cookie);
				    
					if (data.details.next_step=="shipping_address"){
						var options = {
					      animation: 'slide',
					      onTransitionEnd: function() { 						      	  
					      	  displayMerchantLogo2( getStorage("merchant_logo") ,
					      	     getStorage("order_total") ,
					      	     'page-shipping');
					      	     
					      	     fillShippingAddress();
					      } 
					    };     
					    sNavigator.pushPage("shipping.html", options);		
					    		
					} else if ( data.details.next_step =="return_home") {
						onsenAlert(data.msg);
						menu.setMainPage('home.html', {closeMenu: true});
						
				   // mobile verification
				   } else if ( data.details.next_step =="mobile_verification") {
				   	
				   	    removeStorage('client_token');
				   	    
						var options = {
					      animation: 'none',
					      onTransitionEnd: function() { 						      	  
					      	   $(".mobile-verification-msg").show();
					      	   $(".email-verification-msg").hide();
					      	   $(".client_id").val( data.details.client_id);
					      	   $(".is_checkout").val( data.details.is_checkout);
					      	   $(".validation_type").val( data.details.next_step );
					      } 
					    };     
					    sNavigator.pushPage("SignupVerification.html", options);
					    
					// email verification
					} else if ( data.details.next_step =="email_verification") {
				   	
				   	    removeStorage('client_token');
				   	    
						var options = {
					      animation: 'none',
					      onTransitionEnd: function() { 						      	  
					      	   $(".mobile-verification-msg").hide();
					      	   $(".email-verification-msg").show();
					      	   $(".client_id").val( data.details.client_id);
					      	   $(".is_checkout").val( data.details.is_checkout);
					      	   $(".validation_type").val( data.details.next_step );
					      } 
					    };     
					    sNavigator.pushPage("SignupVerification.html", options);
					        
					} else {
						dump('payment_option');
						 var options = {
					      animation: 'slide',
					      onTransitionEnd: function() { 						      	  
					      	  displayMerchantLogo2( 
					      	     getStorage("merchant_logo") ,
					      	     getStorage("order_total") ,
					      	     'page-paymentoption'
					      	  );
					      	  var params="merchant_id="+ getStorage("merchant_id");			
					      	  params+="&transaction_type=" +  getStorage("transaction_type") ;		      	  
					      	  callAjax("getPaymentOptions",params);
					      } 
					    };   
					    sNavigator.pushPage("paymentOption.html", options);	
					}
				break;
				
				case "getPaymentOptions":				
				   $(".frm-paymentoption").show();				   
				   
				   /*$(".client_id_sandbox").val( data.details.paypal_credentials.client_id_sandbox );
			   	   $(".client_id_live").val( data.details.paypal_credentials.client_id_live );*/
				   
			   	   $(".paypal_flag").val( data.details.paypal_flag );			   	   
			   	   if(data.details.paypal_flag==1){
				   	   $(".paypal_mode").val( data.details.paypal_credentials.mode );			   	   			   	   
				   	   $(".client_id").val( data.details.paypal_credentials.client_id );
			   	   }
			   	   
			   	   $(".paypal_card_fee").val( data.details.paypal_credentials.card_fee );	
			   	   setStorage("paypal_card_fee", data.details.paypal_credentials.card_fee );
			   	   
			   	   if (data.details.voucher_enabled=="yes"){
			   	   	   $(".voucher-wrap").show();			   	   	   
			   	   	   $(".voucher_code").attr("placeholder", getTrans("Enter Voucher here",'enter_voucher_here') );
			   	   } else {
			   	   	   $(".voucher-wrap").hide();
			   	   }			

			   	   /*set stripe key*/
			   	   setStorage("stripe_publish_key", data.details.stripe_publish_key );	
			   	   setStorage("stripe_publish_key", data.details.stripe_publish_key );
			   	   
			   	   /*set razor pay*/
			   	   if (!empty(data.details.razorpay)){
			   	   	   setStorage("razor_key_id", data.details.razorpay.razor_key );	
			   	       setStorage("razor_secret_key", data.details.razorpay.razor_secret );
			   	   }
			   	   
			   	   /*pts*/
			   	   if ( getStorage("pts")==2){			   	   	   
			   	   	   dump('pts is enabled');
			   	   	   $(".redeem_points").attr("placeholder",data.details.pts.pts_label_input);
			   	   	   $(".pts_available_points").html(data.details.pts.balance);
			   	   } else {
			   	   	   $(".pts-apply-points-wrap").hide();
			   	   }
			   	   
			   	   /*set ipay88*/
			   	   if (!empty(data.details.ip8_credentials)){
			   	   	   setStorage("ip8_merchantcode", data.details.ip8_credentials.code );	
			   	       setStorage("ip8_merchantkey", data.details.ip8_credentials.key );
			   	   }
			   	   
			   	    /*APPEND DINE INFORMATION*/
					new_fields='';		
			    	if (data.details.transaction_type=="dinein"){
			    		new_fields=DineinFields();					    		
			    		createElement("checkout_information_dinein",new_fields);
			    		$( document ).on( "keyup", ".numeric_only2", function() {
						  this.value = this.value.replace(/[^0-9\.]/g,'');
						});	 					    	
			        }			
			        
			        /*APPEND MOBILE NUMBER INFORMATION*/
			    	if(data.details.show_mobile_number){
			    	  	 new_fields=ContactNumberFields();					    		
			    		 createElement("checkout_information_contact",new_fields);
			    		 initIntelInputs();
			       }			 
			       
			        translateValidationForm();
			   	   			   	   
			   	   displayPaymentOptions(data);
			   	   
			   	   $(".cod_change_required").val( data.details.cod_change_required);
			   	   
				break;				
				
				case "placeOrder":																  
				
				  setStorage("order_id",data.details.order_id);
				  
				  switch (data.details.next_step){
				  	
				  	   case "paypal_init":
				  	   				  	   
				  	   setStorage("currency_code", data.details.payment_details.currency_code);
				  	   setStorage("paymet_desc", data.details.payment_details.paymet_desc);
				  	   setStorage("total_w_tax", data.details.payment_details.total_w_tax);
				  	   
				  	   app_paypal.initPaymentUI();
				  	   break;

				  	   case "atz_init":
				  	      var options = {
						      animation: 'slide',
						      onTransitionEnd: function() {
						      	  $(".order_id").val( data.details.order_id );
						      	  $(".currency_code").val( data.details.payment_details.currency_code );
						      	  $(".paymet_desc").val( data.details.payment_details.paymet_desc );
						      	  $(".total_w_tax").val( data.details.payment_details.total_w_tax );
						      } 
						  }; 
						  sNavigator.pushPage("atzPaymentForm.html", options);
				  	   break;
				  	   
				  	   
				  	   case "stp_init":
				  	      var options = {
						      animation: 'slide',
						      onTransitionEnd: function() {
						      	  $(".order_id").val( data.details.order_id );
						      	  $(".currency_code").val( data.details.payment_details.currency_code );
						      	  $(".paymet_desc").val( data.details.payment_details.paymet_desc );
						      	  $(".total_w_tax").val( data.details.payment_details.total_w_tax );
						      } 
						  }; 
						  sNavigator.pushPage("stripePaymentForm.html", options);
				  	   break;
				  	   
				  	   case "rzr_init":
				  	     
				  	     var razor_key_id = getStorage("razor_key_id");				  	     
				  	     
				  	     if(empty(razor_key_id)){
				  	     	onsenAlert( getTrans("Key id is empty","key_id_empty") );
				  	     	return;
				  	     }
				  	     
				  	     var rzr_options = {
						  description: data.details.payment_details.paymet_desc ,						  
						  currency: data.details.payment_details.currency_code ,
						  key: razor_key_id ,
						  amount: data.details.payment_details.total_w_tax_times,
						  name: data.details.payment_details.merchant_name ,
						  prefill: {
						    email: data.details.payment_details.customer_email ,
						    contact: data.details.payment_details.customer_contact ,
						    name: data.details.payment_details.customer_name
						  },
						  theme: {
						    color: data.details.payment_details.color
						  }
						};
						
						dump(rzr_options);
						
						if(isDebug()){
						   rzr_successCallback('pay_debug_1234566');
						} else {
						   RazorpayCheckout.open(rzr_options, rzr_successCallback, rzr_cancelCallback);
						}
				  	     
				  	   break;
				  	   
				  	   case "mri_init":
				  	      var options = {
						      animation: 'slide',
						      onTransitionEnd: function() {
						      	  $(".order_id").val( data.details.order_id );
						      	  $(".currency_code").val( data.details.payment_details.currency_code );
						      	  $(".paymet_desc").val( data.details.payment_details.paymet_desc );
						      	  $(".total_w_tax").val( data.details.payment_details.total_w_tax );
						      } 
						  }; 
						  sNavigator.pushPage("monerisForm.html", options);
				  	   break;
				  	   				  	   
				  	   case "ip8_init":
				  	     				  	     
				  	     /*alert(getStorage("ip8_merchantcode"));
				  	     alert(getStorage("ip8_merchantkey"));*/				  	     
				  	     
				  	     if(isDebug()){
				  	     	var params="payment_id=1234567890";
							params+="&order_id=55555-"+ data.details.order_id ;
							params+="&client_token="+ getStorage("client_token");	
							callAjax("iPay88Successfull",params);	  
				  	     	return;
				  	     }
				  	     
				  	     //alert(JSON.stringify(data.details.ipay88_details));  
				  	     
				  	     cloudSky.iPay88.makePayment(
						    {
						        amount: data.details.ipay88_details.amount ,
						        name:  data.details.ipay88_details.name ,
						        email: data.details.ipay88_details.email ,
						        phone: data.details.ipay88_details.phone ,
						        refNo: data.details.ipay88_details.refNo ,
						        currency: data.details.ipay88_details.currency ,
						        lang: data.details.ipay88_details.lang ,
						        country: data.details.ipay88_details.country ,
						        description: data.details.ipay88_details.description ,	
						        remark: data.details.ipay88_details.remark ,
						        paymentId: data.details.ipay88_details.paymentId ,					        
						        merchantKey: getStorage("ip8_merchantkey") ,
						        merchantCode: getStorage("ip8_merchantcode") ,
						        backendPostUrl: data.details.ipay88_details.backendPostUrl
						    },
						    function (resp) {
						        //alert("Success callback ");
						        //alert(JSON.stringify(resp));     
						        						        
						        var params="payment_id="+resp.transactionId;
								params+="&order_id="+ resp.referenceNo;
								params+="&client_token="+ getStorage("client_token");	
								callAjax("iPay88Successfull",params);	  
	     
						        // resp = { 
						        //     transactionId: transId, 
						        //     referenceNo: refNo, 
						        //     amount: amount, 
						        //     remarks: remarks, 
						        //     authCode: auth, 
						        // } 
						    },
						    function (err) {						        
						        //alert(JSON.stringify(err));           
						        onsenAlert(err.err);
						        // err = "unexpected error string" OR 
						        // err = { 
						        //     transactionId: transId, 
						        //     referenceNo: refNo, 
						        //     amount: amount, 
						        //     remarks: remarks, 
						        //     err: error message, // "canceled" if user canceled the payment. 
						        // } 
						    }
						)				  	     
				  	     
				  	   break;
				  	   				  	   
				  	   default:		
				  	   var options = {
					      animation: 'slide',
					      onTransitionEnd: function() { 						      	  
					      	  /*displayMerchantLogo2( getStorage("merchant_logo") ,
					      	                      getStorage("order_total") ,
					      	                      'page-receipt');*/
					      	  displayMerchantLogo2( getStorage("merchant_logo") ,
					      	                      data.details.payment_details.total_w_tax_pretty ,
					      	                      'page-receipt');
					      	  $(".receipt-msg").html(data.msg); 
					      } 
					    };     
					    sNavigator.pushPage("receipt.html", options);
				  	   
				  	   break;
				  }
				  break;
				  
				case "paypalSuccessfullPayment": 
				case "PayAtz":  
				case "PayStp":
				case "razorPaymentSuccessfull":
				case "iPay88Successfull":
				case "monerisPay":
				     
				       var amount_to_pay=data.details.amount_to_pay;
				       if(amount_to_pay==0){
				       	  amount_to_pay=getStorage("order_total");
				       }
					   var options = {
					      animation: 'slide',
					      onTransitionEnd: function() { 						      	  
					      	  displayMerchantLogo2( getStorage("merchant_logo") ,
					      	                       prettyPrice(amount_to_pay) ,
					      	                      'page-receipt');
					      	  $(".receipt-msg").html(data.msg); 
					      } 
					    };     
					    sNavigator.pushPage("receipt.html", options);
				   break;  
				
				case "getMerchantInfo":
				   showMerchantInfo(data.details)
				   break;
								
				case "bookTable":
				  var options = {
				      animation: 'slide',
				      onTransitionEnd: function() { 			
				      	  displayMerchantLogo2( 
				      	     getStorage("merchant_logo") ,
				      	     '' ,
				      	     'page-booking-ty'
				      	  );    
				      	  				      	 	      	 
				      	  $(".book-ty-msg").html(data.msg);
				      } 
				    };     
				    sNavigator.pushPage("bookingTY.html", options);
				    break;
				
				case "merchantReviews":
				   displayReviews(data.details);
				   break;
				
				case "addReview":
				   onsenAlert(data.msg);
				   sNavigator.popPage({cancelIfRunning: true}); 
				   loadMoreReviews();
				   break;
				   				   
				
				case "browseRestaurant":
				   displayRestaurantResults( data.details.data ,'browse-results');
				   //$(".result-msg").text(data.details.total+" Restaurant found");
				   $(".result-msg").text(data.details.total+" "+ getTrans("Restaurant found",'restaurant_found')  );
				   break;   
				   
				case "getProfile":   
				  $(".first_name").val( data.details.first_name );
				  $(".last_name").val( data.details.last_name );
				  $(".email_address").val( data.details.email_address );
				  $(".contact_phone").val( data.details.contact_phone );
				  
				  $(".avatar").attr("src", data.details.avatar );
				  
				  dump('set avatar');
				  setStorage("avatar",data.details.avatar);
				  
				  imageLoaded('.img_loaded');
				  
				  initIntelInputs();
				  
				  break;   
				  
				case "registerUsingFb":  
				case "login": 
				  //onsenAlert(data.msg);				  			
				  setStorage("client_token",data.details.token);
				  
				  setStorage("avatar",data.details.avatar);
                  setStorage("client_name_cookie",data.details.client_name_cookie);
				  
				  switch (data.details.next_steps)
				  {
				  	 case "delivery":
					  	 var options = {
					      animation: 'slide',
					      onTransitionEnd: function() { 						      	  
					      	  displayMerchantLogo2( getStorage("merchant_logo") ,
					      	     getStorage("order_total") ,
					      	     'page-shipping');
					      	     					      	     					      	     					      	   
						      	  /*if (data.details.has_addressbook==2){					      	  	 
						      	  	 $(".select-addressbook").css({"display":"block"});
						      	  } else {
						      	  	 $(".select-addressbook").hide();					      	  	 
						      	  }*/
						      	  
						      	  
                                 if(!empty(data.details.contact_phone)){
					      	  	     $(".contact_phone").val( data.details.contact_phone ) ;
					      	     }
					      	     if(!empty(data.details.location_name)){
					      	  	     $(".location_name").val( data.details.location_name ) ;
					      	     }
						      	  					      	     					      	     
						      	 if ( !empty( getStorage("map_address_result_formatted_address") )){
					      	  	     $(".delivery-address-text").html( getStorage("map_address_result_formatted_address") );
					      	  	     $(".street").val( getStorage("map_address_result_address") );
									 $(".city").val( getStorage("map_address_result_city") );
									 $(".state").val( getStorage("map_address_result_state") );
									 $(".zipcode").val( getStorage("map_address_result_zip") );	
									 $(".formatted_address").val( getStorage("map_address_result_formatted_address") );	
									 
									 $(".google_lat").val( getStorage("google_lat") );	
									 $(".google_lng").val( getStorage("google_lng") );	
					      	  	 } else {
					      	  	    if (data.details.has_addressbook==2){
					      	  	    	
					      	  	       $(".delivery-address-text").html( data.details.default_address.address );
					      	  	       $(".street").val (  data.details.default_address.street  );
									   $(".city").val( data.details.default_address.city  );
									   $(".state").val( data.details.default_address.state );
									   $(".zipcode").val(  data.details.default_address.zipcode );	
									   $(".formatted_address").val( data.details.default_address.address );	
					      	  	    	
					      	  	    }					      	  	 
					      	  	 }					      	  	
					      } 
					     };     
					     sNavigator.pushPage("shipping.html", options);		
				  	 break;
				  	 
				  	 case "pickup":
				  	 case "dinein":				  	 
				  	 
				  	   var options = {
					      animation: 'slide',
					      onTransitionEnd: function() { 						      	  
					      	  displayMerchantLogo2( 
					      	     getStorage("merchant_logo") ,
					      	     getStorage("order_total") ,
					      	     'page-paymentoption'
					      	  );
					      	  var params="merchant_id="+ getStorage("merchant_id");
					      	  params+="&client_token="+ getStorage("client_token");
					      	  params+="&transaction_type=" +  getStorage("transaction_type") ;
					      	  callAjax("getPaymentOptions",params);
					      } 
					    };   
					    sNavigator.pushPage("paymentOption.html", options);		
				  	 
				  	 break;
				  	 
				  	 
				  	 default:
				  	 menu.setMainPage('home.html', {closeMenu: true});
				  	 break;
				  }	
				  
				  
				  break;   
				  
				case "forgotPassword":  
				  onsenAlert(data.msg);	
				  dialogForgotPass.hide();
				  break;   
				  
				case "getOrderHistory":  
				  displayOrderHistory(data.details);
				  break;   
				  
				case "ordersDetails":  
				  displayOrderHistoryDetails(data.details);
				  break;  
				   
				case "getAddressBook":  
				  displayAddressBook(data.details);
				  break;  
				  
			    case "getAddressBookDetails":
			      fillAddressBook(data.details);
			      break;  
			      
			    case "saveAddressBook":  
			      if (data.details=="add"){
			         sNavigator.popPage({cancelIfRunning: true});
			         
			         callAjax('getAddressBook',
					  "client_token="+getStorage("client_token")
					  );
			      } else {
			      	  onsenAlert(data.msg);
			      }
			      break;  
			      
			    case "deleteAddressBook":  
			         sNavigator.popPage({cancelIfRunning: true});			         
			         callAjax('getAddressBook',
					  "client_token="+getStorage("client_token")
					  );
			      break;  
			      
			    case "getAddressBookDialog":  
			       displayAddressBookPopup(data.details);
			       break; 
			       
			    case "reOrder":   
			       setStorage("merchant_id",data.details.merchant_id)
			       cart=data.details.cart;
			       showCart();
			       break;
			       			      
			    /*case "registerUsingFb":   
			       onsenAlert(data.msg);
			       setStorage("client_token",data.details.token);
			       menu.setMainPage('home.html', {closeMenu: true});
			       break;*/

			    case "registerMobile":
			    /*silent */
			    break;
			    
			    case "reverseGeoCoding":
			       $("#s").val( data.details );
			       break;
			          
			    
			    case "getSettings":      			       
			       if ( data.details.enabled_push==1){		
			       	   enabled_push.setChecked(true);			       	   	       	  			       	  
			       } else {			       	  
			       	   enabled_push.setChecked(false);
			       }			
			       $(".country_code_set").val( data.details.country_code_set);
			       
			       var device_id=getStorage("device_id");
			       $(".device_id_val").html( device_id );
			       break;
			       
			    case "mobileCountryList":   
			       displayLocations(data.details);
			       break;
			   
			    case "getLanguageSelection":
			       displayLanguageSelection(data.details);
			       break;    
			       
			    case "getLanguageSettings":   			       		      
			       setStorage("translation",JSON.stringify(data.details.translation));
			       
			       dump(data);
			       /*set settings to storage*/			       
			       setStorage("decimal_place",data.details.settings.decimal_place);
			       setStorage("currency_position",data.details.settings.currency_position);
			       setStorage("currency_set",data.details.settings.currency_set);
			       setStorage("thousand_separator",data.details.settings.thousand_separator);
			       setStorage("decimal_separator",data.details.settings.decimal_separator);
			       setStorage("show_addon_description",data.details.settings.show_addon_description);

			       var device_set_lang=getStorage("default_lang");
			       
			       /*CHECK FORCE LANGUAGE*/
			       if(!empty(data.details.settings.force_app_default_lang)){
			       	   device_set_lang  = data.details.settings.force_app_default_lang;
			       	   setStorage("default_lang",device_set_lang);
			       }
			       
			       dump("device_set_lang=>"+device_set_lang);
			       
			       if (empty(device_set_lang)){
			       	   dump('proceed');
				       if(!empty(data.details.settings.default_lang)){			       	  
				          setStorage("default_lang",data.details.settings.default_lang);
				       } else {
				       	  setStorage("default_lang","");
				       }			
			       } 
			       
			       
			       /*single food item*/
			       setStorage('single_add_item', data.details.settings.single_add_item );
			       
			       /*pts*/
			       setStorage("pts",data.details.settings.pts);
			       
			/*Atualização Master Hub*/
				   /*banner_topo*/
				   setStorage("banner_topo",data.details.settings.banner_topo);
				   
				   /*codigo_do_banner*/
				   setStorage("codigo_do_banner",data.details.settings.codigo_do_banner);

				   /*busca_categoria*/
				   setStorage("busca_categoria",data.details.settings.busca_categoria);

				   /*codigo_da_busca*/
				   setStorage("codigo_da_busca",data.details.settings.codigo_da_busca);

				   /*busca_seguimentos*/
				   setStorage("busca_seguimentos",data.details.settings.busca_seguimentos);

				   /*codigo_dos_seguimentos*/
				   setStorage("codigo_dos_seguimentos",data.details.settings.codigo_dos_seguimentos);
				   
				   /*exibir_ofertas*/
				   setStorage("exibir_ofertas",data.details.settings.exibir_ofertas);
				   
				   /*codigo_das_ofertas*/
				   setStorage("codigo_das_ofertas",data.details.settings.codigo_das_ofertas);
				   
				   /*exibir_nossa_missao*/
				   setStorage("exibir_nossa_missao",data.details.settings.exibir_nossa_missao);

				   /*codigo_nossa_missao*/
				   setStorage("codigo_nossa_missao",data.details.settings.codigo_nossa_missao);

				   /*exibir_trabalhe_conosco*/
				   setStorage("exibir_trabalhe_conosco",data.details.settings.exibir_trabalhe_conosco);

				   /*codigo_trabalhe_conosco*/
				   setStorage("codigo_trabalhe_conosco",data.details.settings.codigo_trabalhe_conosco);

				   /*exibir_trabalhe_conosco*/
				   setStorage("exibir_menu_rodape",data.details.settings.exibir_menu_rodape);

				   /*codigo_trabalhe_conosco*/
				   setStorage("codigo_menu_rodape",data.details.settings.codigo_menu_rodape);

				   /*forcar_atualizar*/
				   setStorage("forcar_atualizar",data.details.settings.forcar_atualizar);

				   /*versao_aplicativo*/
				   setStorage("versao_aplicativo",data.details.settings.versao_aplicativo);
				   setStorage("versao_aplicativo_code",data.details.settings.versao_aplicativo_code);
				   if(!isDebug()){
				   setStorage("versao",BuildInfo.version);
				   setStorage("versaoCode",BuildInfo.versionCode);
				   }

				   /*link_google_play*/
				   setStorage("link_google_play",data.details.settings.link_google_play);
				   /*link_apple_store*/
				   setStorage("link_apple_store",data.details.settings.link_apple_store);
			/*Fim da atualização*/
			
			       /*facebook_flag*/
			       setStorage("facebook_flag",data.details.settings.facebook_flag);
			       
			       /*avatar*/
			       setStorage("avatar",data.details.settings.avatar);
			       setStorage("client_name_cookie",data.details.settings.client_name_cookie);			       
			       setStorage("mobile_country_code",data.details.settings.mobile_country_code);
			       
			       setStorage("from_icon",data.details.settings.map_icons.from_icon);
			       setStorage("destination_icon",data.details.settings.map_icons.destination_icon);
			       
			       setStorage("mobile_save_cart_db",data.details.settings.mobile_save_cart_db);
			       
			       //translatePage();	  
			       var options = {
				      animation: 'slide',
				      onTransitionEnd: function() { 		
				      	 initSlideMenu();				      	  					      	  
				      } 
				   };     
				   kSettingsNavigator.pushPage("slidingMenu.html", options);	
			       
			       break;
			       
			   case "applyVoucher":   
			       dump(data.details);			       
			       $(".voucher_amount").val( data.details.amount );
			       $(".voucher_type").val( data.details.voucher_type );
			       
			       $(".apply-voucher").hide();
			       $(".remove-voucher").css({
			       	  "display":"block"
			       });
			       
			       $(".voucher-header").html(data.details.less);
			       
			       var new_total= data.details.new_total;
			       $(".total-amount").html( prettyPrice(new_total) );
			       
			       break;
			       
			       
			    case "validateCLient":   
			       setStorage("client_token", data.details.token ); // register token
                   onsenAlert(data.msg);
                   
                   if ( data.details.is_checkout=="shipping_address"){
                   	   var options = {
					      animation: 'slide',
					      onTransitionEnd: function() { 						      	  
					      	  displayMerchantLogo2( getStorage("merchant_logo") ,
					      	     getStorage("order_total") ,
					      	     'page-shipping');
					      	     					      	     
					      	     fillShippingAddress();
					      	     
					      } 
					    };     
					    sNavigator.pushPage("shipping.html", options);	
					    
                   } else if ( data.details.is_checkout=="payment_option" )  {
						 var options = {
					      animation: 'slide',
					      onTransitionEnd: function() { 						      	  
					      	  displayMerchantLogo2( 
					      	     getStorage("merchant_logo") ,
					      	     getStorage("order_total") ,
					      	     'page-paymentoption'
					      	  );
					      	  var params="merchant_id="+ getStorage("merchant_id");
					      	  params+="&client_token="+ getStorage("client_token");
					      	  params+="&transaction_type=" +  getStorage("transaction_type") ;
					      	  callAjax("getPaymentOptions",params);
					      } 
					    };   
					    sNavigator.pushPage("paymentOption.html", options);	   
                   	
                   } else {
                      menu.setMainPage('home.html', {closeMenu: true});
                   }
			       break;
			       
			    /*pts*/
			    case "getPTS":   
			       $(".available_points").html( data.details.available_points );
			       $(".expenses_points").html( data.details.total_expenses_points );
			       $(".expired_points").html( data.details.points_expiring );
			    break;
			    
			    case "detailsPTS":
			      $(".pts_title").html(data.details.title);
			      displayPTSdetails(data.details.data);
			    break;
			    
			    
			    case "applyRedeemPoints":
			    
			      $(".pts_redeem_points").val( data.details.pts_points_raw );
			      $(".pts_redeem_amount").val( data.details.pts_amount_raw );
			      $(".pts_points_label").html( data.details.pts_points +" ("+ data.details.pts_amount+")" );
			      $(".pts_pts").hide();
			      $(".pts_pts_cancel").css({"display":"block"});
			      
			      
			      var new_total= data.details.new_total;
			      dump('compute new total for pts');
			      
			      $(".total-amount").html( prettyPrice(new_total) );
			      
			    break;
			    
			    case "addToCart":
			    //onsenAlert(  getTrans("Item added to cart",'item_added_to_cart') );
			    toastMsg( getTrans("Item added to cart",'item_added_to_cart') );
			    break;
			    
			   
			    case "getCustomFields":
			      var custom_fields='';
			      $.each( data.details, function( key, val ) {     			      	  
			      	 custom_fields+= customFields(key,val);
			      });			      
                  createElement("custom-fields-wrap",custom_fields);
                  
                  if ( data.msg=="yes"){
                  	  $(".iagree-wrap").show();
                  } else $(".iagree-wrap").hide();
                  
			    break;
			    
			    case "verifyAccount":
			      setStorage("client_token", data.details.token ); // register token
			      toastMsg( data.msg );
			      menu.setMainPage('home.html', {closeMenu: true});
			    break;

			    case "coordinatesToAddress":	
			    
			       var your_location = new plugin.google.maps.LatLng(data.details.lat,data.details.lng); 
			       
			       var marker_title='';			       
			       marker_title+=data.details.result.formatted_address;
			       
			       setStorage("map_address_result_address",data.details.result.address);
			       setStorage("map_address_result_city",data.details.result.city);
			       setStorage("map_address_result_state",data.details.result.state);
			       setStorage("map_address_result_zip",data.details.result.zip);
			       setStorage("map_address_result_country",data.details.result.country);
			       setStorage("map_address_result_formatted_address",data.details.result.formatted_address);
			       
			       setStorage("google_lat",data.details.lat);
			       setStorage("google_lng",data.details.lng);
			       
			        map_search.addMarker({
					  'position': your_location ,
					  'title': marker_title,
					  'snippet': getTrans( "Press on marker 2 seconds to drag" ,'press_marker'),
					  'draggable': true				  
					}, function(marker) {
						
					   marker.showInfoWindow();
					   if(drag_marker_bounce==1){
					      marker.setAnimation(plugin.google.maps.Animation.BOUNCE);
					   }
					   
					   drag_marker=marker;
					   drag_marker_bounce=2;					   
					   
					   marker.addEventListener(plugin.google.maps.event.MARKER_DRAG_END, function(marker) {
							marker.getPosition(function(latLng) {								 
								 temp_result=explode(",", latLng.toUrlValue() );
								 /*alert(temp_result[0]);
								 alert(temp_result[1]);*/
								 drag_marker=marker;
								 callAjax("dragMarker","lat=" + temp_result[0] + "&lng="+ temp_result[1] );	 
							});
					   });
										   
					}); /*marker*/	    
			    break;
			    
			    case "dragMarker":
			    
			       setStorage("map_address_result_address",data.details.result.address);
			       setStorage("map_address_result_city",data.details.result.city);
			       setStorage("map_address_result_state",data.details.result.state);
			       setStorage("map_address_result_zip",data.details.result.zip);
			       setStorage("map_address_result_country",data.details.result.country);
			       setStorage("map_address_result_formatted_address",data.details.result.formatted_address);
			       
			       setStorage("google_lat",data.details.lat);
			       setStorage("google_lng",data.details.lng);	       
			       
			       drag_marker.setTitle( data.details.result.formatted_address );
			       drag_marker.showInfoWindow();
			    break;
			    
			    case "trackOrderHistory":	
			    
			       $(".track-status-wrap").html(''); 
			       
			       $(".time-left").html( data.details.time_left );
			       $(".remaining").html( data.details.remaining );
			       
			       if ( data.details.history.length>0){
			       	  var html='<ul>';
			       	  $.each( data.details.history , function( key, val ) {     
			       	  	  dump(val);
			       	  	  html+='<li>';
				       	  	  html+='<div class="s-c-g"></div>';
				       	  	  html+='<p style="color: #ddd; font-size: 15px;">'+val.date_time+'</p>';
				       	  	  html+='<h3>'+val.status+'</h3>';
			       	  	  html+='</li>';
			       	  });
			       	  html+='</ul>';
			       	  $(".track-status-wrap").append( html );
			       }
			       
			       if ( data.details.assign_driver==1){
			       	   $(".track_driver").show();
			       	   
			       	   $(".driver_lat").val( data.details.coordinates.driver_lat );
			       	   $(".driver_lng").val( data.details.coordinates.driver_lng );
			       	   
			       	   $(".task_lat").val( data.details.coordinates.task_lat );
			       	   $(".task_lng").val( data.details.coordinates.task_lng );
			       	   
			       	   $(".driver_name").val( data.details.driver_info.driver_name );
			       	   $(".driver_email").val( data.details.driver_info.driver_email );
			       	   $(".driver_phone").val( data.details.driver_info.driver_phone );
			       	   $(".transport_type").val( data.details.driver_info.transport_type );
			       	   $(".licence_plate").val( data.details.driver_info.licence_plate );
			       	   $(".delivery_address").val( data.details.delivery_address );
			       	   
			       	   $(".driver_icon").val( data.details.driver_icon );
			       	   $(".address_icon").val( data.details.address_icon );
			       	   $(".driver_avatar").val( data.details.driver_avatar );
			       	   
			       }  else {
			       	   $(".track_driver").hide();
			       	   
			       	   $(".driver_lat").val('');
			       	   $(".driver_lng").val('');
			       	   
			       	   $(".task_lat").val('');
			       	   $(".task_lng").val('');
			       	   
			       	   $(".driver_name").val( '' );
			       	   $(".driver_email").val( '' );
			       	   $(".driver_phone").val( '' );
			       	   $(".transport_type").val( '' );
			       	   $(".licence_plate").val( '' );
			       	   $(".delivery_address").val( '' );
			       	   $(".driver_avatar").val( '' );
			       }
			       
			       stopTrackInterval();
		           track_order_interval = setInterval(function(){runTrackOrder()}, 7000);
			       
			    break;
			    
			    
			    case "saveContactNumber":	
			    		    
                   var options = {
				      animation: 'slide',
				      onTransitionEnd: function() { 						      	  
				      	  displayMerchantLogo2( 
				      	     getStorage("merchant_logo") ,
				      	     getStorage("order_total") ,
				      	     'page-paymentoption'
				      	  );
				      	  var params="merchant_id="+ getStorage("merchant_id");
				      	  params+="&client_token="+ getStorage("client_token");
				      	  params+="&transaction_type=" +  getStorage("transaction_type") ;
				      	  callAjax("getPaymentOptions",params);
				      } 
				    };   
				    sNavigator.pushPage("paymentOption.html", options);		

			    break;
			    
			    case "trackOrderMap":
			       reInitTrackMap(data.details);
			    break;
			    
			    case "getMerchantCClist":
			       fillCCList(data.details);
			    break;
			    
			    case "saveCreditCard":
			    case "deleteCreditCard":
			        sNavigator.popPage({cancelIfRunning: true});			        
			        var params="merchant_id=" +  getStorage("merchant_id") ;
			      	params+="&client_token="+getStorage("client_token");
				    callAjax("getMerchantCClist",params);			        
			    break;
			    
			    case "loadCC":
			       $(".card_name").val( data.details.card_name);
			       $(".cc_number").val( data.details.credit_card_number);
			       $(".cvv").val( data.details.cvv);
			       $(".billing_address").val( data.details.billing_address);
			       
			       $(".expiration_month").val( data.details.expiration_month);
			       $(".expiration_yr").val( data.details.expiration_yr);
			       $(".expiration_month_label").html( data.details.expiration_month );
			       $(".expiration_year").html( data.details.expiration_yr );

			       $(".cc_id").val( data.details.cc_id );	
			       
			       $(".delete-cc").show();
			       
			    break;
			    
				default:
				//onsenAlert("Sorry but something went wrong during processing your request");
				  onsenAlert(data.msg);	
				  break;				
			}
			
			/* end ok conditions*/
		} else {
			/*failed condition*/
			
			dump('failed condition');
			switch(action)
			{					
											
				case "search":
				  //$(".result-msg").text("No Restaurant found");
				  $(".result-msg").text(data.msg);
				  createElement('restaurant-results','');
				  break;
								
				case "getItemByCategory":				
				  onsenAlert(data.msg);	
				  displayMerchantInfo(data.details);			
				  //sNavigator.popPage({cancelIfRunning: true});	back button
				  break;
				
				case "loadCart":				
				  displayMerchantLogo(data.details,'page-cart');
				  //onsenAlert(data.msg);
				  toastMsg(data.msg);
				  
				  $("#page-cart .wrapper").hide();				
				  $("#page-cart .frm-cart").hide();	
				  $(".checkout-footer").hide();
				  showCartNosOrder();
				  break;
				
				case "getPaymentOptions":
				  if ( data.details==3){
				  	  onsenAlert(data.msg);
				  	  sNavigator.popPage({cancelIfRunning: true});
				  } else {
					  $(".frm-paymentoption").hide();
					  onsenAlert(data.msg);
				  }
				  break;
				
				case "browseRestaurant":
			      createElement('browse-results','');
			      $(".result-msg").text(data.msg);
			      break;   
				
			    case "getProfile":  
			      dump('show login form')
			      menu.setMainPage('prelogin.html', {closeMenu: true});
			      break;   
			      
			    case "getAddressBook":  		
			      //onsenAlert(data.msg);
			      createElement('address-book-list', '');
			      if (data.code==3){
			      	 menu.setMainPage('prelogin.html', {closeMenu: true});
			      }			      
			      break;   
			      
			    case "getOrderHistory":  
			       if (data.code==3){
			           menu.setMainPage('prelogin.html', {closeMenu: true}); 
			       } else {
			       	   toastMsg(data.msg);
			       }
			       break;   
			      			    
			    case "registerMobile":  			    
			    //case "getLanguageSettings":  
			      /*silent */
			      break;   
			      
			    case "getLanguageSettings":   
			      toastMsg(data.msg);
			      break;   
			      

			    case "getSettings":      
			       var device_id=getStorage("device_id");
			       $(".device_id_val").html( device_id );
			    break;   
			       
			    
			    /*silent*/
			    case "addToCart":
			    case "getCustomFields":
			    break;
			    
			    case "merchantReviews":
			    case "saveContactNumber":
			    case "coordinatesToAddress":
			    case "trackOrderMap":			    
			       toastMsg(data.msg);
			    break;
			    
			    case "getMerchantCClist":
			       toastMsg(data.msg);
			       $("#cc-list").html('');
			    break;
			    
			    case "trackOrderHistory":		
			    case "loadCC":	        
			    sNavigator.popPage({cancelIfRunning: true}); //back button
			    break;
			    
				default:
				  onsenAlert(data.msg);					
				  break;
			}			
		}
				
	},
	error: function (request,error) {	        
		hideAllModal();		
		//if ( action=="getLanguageSettings" || action=="registerMobile"){
		if ( action=="registerMobile"){
		} else {			
			//onsenAlert( getTrans("Network error has occurred please try again!",'network_error') );		
			toastMsg( getTrans("Network error has occurred please try again!",'network_error') );		
		}	
	}
   });       	
}

function setHome()
{
	dump("setHome");
	var options = {     	  		  
	  	  closeMenu:true,
	      animation: 'slide',
	      callback:setHomeCallback
	   };	   	   	   
	 menu.setMainPage('home.html',options);
}

function setHomeCallback()
{	
	refreshConnection();
}

function displayRestaurantResults(data , target_id)
{	
	//dump(data);
	var htm='';	
       
	var abertas = new Array();
	var fechadas = new Array();

	for(var i=0; i<data.length; i++) {
		if (data[i].is_open == 'Fechado')
			fechadas.push(data[i]);
		else
			abertas.push(data[i]);
	}
	data = abertas.concat(fechadas);
    $.each( data, function( key, val ) {     
    	
    	// dump(val);
    	 
    	 htm+='<ons-list-item modifier="tappable" class="list-item-container" onclick="loadRestaurantCategory('+val.merchant_id+');" >';
    	 htm+='<ons-row class="row">';    	 
    	     htm+='<ons-col class="col-image border" width="30%">';
    	          htm+='<div class="logo-wrap2" >';
    	            htm+='<div class="img_loaded" style="border-radius: 40px; overflow:hidden;">';
    	             htm+='<img src="'+val.logo+'" />';
    	            htm+='</div>';
    	            
    	          htm+='</div>';
    	          
    	          
    	              	          
    	          //htm+='<p class="center">'+val.payment_options.cod+'</p>';
    	         /* if(!empty(val.payment_available)){ 
    	          	 if(val.payment_available.length>0){
    	          	 	$.each( val.payment_available, function( key_pv, val_pv ) { 
    	          	 		 htm+='<p class="center">'+val_pv+'</p>';
    	          	 	});	
    	          	 }
    	          }*/
    	           
	    	           
    	     htm+='<div align="center"><span class="notification '+val.tag_raw+' ">'+val.is_open+'</span></div>';
    	     htm+='</ons-col>';
    	     
    	     htm+='<ons-col class="col-description border" width="70%">';
    	           htm+='<div>';
	    	           htm+='<div><span class="rating-stars" data-score="'+val.ratings.ratings+'">';
					   htm+='</span></div>  ';
	    	           htm+='<p class="restauran-title concat-text">'+val.restaurant_name+'</p>';
	    	         
	    	           
	    	           
					   dump(val.service);
    	          
    	          if(!empty(val.services)){
    	          	  $.each( val.services, function( key_service, val_services ) { 
    	           	   	  htm+='<class="center" style="font-size: 12px; color: #fff;"><i class="green-color ion-android-checkmark-circle"></i> '+val_services+'   ';
    	           	   });
    	          }
					  					  /*Estimativa de entrega*/
					  if(val.service!=3){
	    	           	   if(!empty(val.delivery_estimation)){
	    	       htm+='<span class="p-small trn"><i class="green-color ion-android-time" style="font-size: 15px;"></i> <b>'+val.delivery_estimation+'</b></span>';	
	    	           	   }
					    }

	    	           
					   
    	           htm+='</div>';
    	           
    	           
    	              htm+='<ons-col width="90%">';
						/* Cupom
						if(!empty(val.tag_cupom)){
		  				htm+='<span class="p-small trn"><i class="green-color ion-social-usd"></i> '+val.tag_cupom+'</span><br> ';
			};
			Fim Cupom */
						
					   /*Fim Estimativa de entrega*/
					   /*Taxa de entrega*/
    	             if(val.service!=3){
    	                   htm+='<span class="p-small trn"><i class="fa green-color fa-motorcycle" style="font-size: 15px;"></i> ';
	
    	                   if(!empty(val.delivery_fee)){
    	                      htm+='<price>'+val.delivery_fee+'</price></span>';
    	                   }
    	                 }
    	             /*Fim Taxa de entrega*/
					 
					 /*Pedido minímo*/
    	              
					   	  if (!empty(val.minimum_order)){  
						  htm+='     <i class="fa green-color fa-money aria-hidden="true"" style="font-size: 15px;"></i>  <span class="p-small trn" data-trn-key="min_order">Min. Order</span>';
    	                  htm+='<price> '+val.minimum_order+'</price>';
						  }
						  htm+='<ons-col width="90%"">';
	    	           if ( val.offers.length>0){
	    	           	   $.each( val.offers, function( key_offer, val_offer ) { 
	    	           	   	  htm+='<p class="center"><i class="fa fa-tags" aria-hidden="true"></i> '+val_offer+'</p>';
	    	           	   });
	    	           }
    	              htm+='</ons-col>';
					  /*Fim Pedido minímo*/

					  
    	              htm+='</ons-col>'; 
    	           
    	     htm+='</ons-col>';
    	     
    	 htm+='</ons-row>';
    	 htm+='</ons-list-item>';
    });
      
    createElement(target_id,htm);
        
    initRating();  
    
    imageLoaded('.img_loaded');
}

function initRating()
{
	$('.rating-stars').raty({ 
		readOnly: true, 
		score: function() {
             return $(this).attr('data-score');
       },
		path: 'lib/raty/images'
    });
    translatePage();
}

function loadRestaurantCategory(mtid)
{	
	
  cart = [] ; /*clear cart variable*/
  removeStorage("tips_percentage");  
  removeStorage("cc_id");  
  
  dump('clear cart');
  var options = {
      animation: 'slide',
      onTransitionEnd: function() { 
      	  callAjax("MenuCategory","merchant_id="+mtid + "&device_id=" + getStorage("device_id")  );	
      } 
   };
   setStorage("merchant_id",mtid);
   sNavigator.pushPage("menucategory.html", options);
}

function carregarEstabelecimento(mtid)
{	
	
	  var s = $('#s').val();  
  
  /*clear all storage*/
  setStorage("search_address",s);   
  removeStorage('merchant_id');
  removeStorage('shipping_address');  
  removeStorage('merchant_id');
  removeStorage('transaction_type');
  removeStorage('merchant_logo');
  removeStorage('order_total');
  removeStorage('merchant_name');
  removeStorage('total_w_tax');
  removeStorage('currency_code');
  removeStorage('paymet_desc');
  removeStorage('order_id');   
  removeStorage('order_total_raw');   
  removeStorage('cart_currency_symbol');     
  removeStorage('paypal_card_fee');   
  
  removeStorage('cart_sub_total');
  removeStorage('cart_delivery_charges');
  removeStorage('cart_packaging');
  removeStorage('cart_tax');
  removeStorage('map_address_result_formatted_address');
  removeStorage("customer_contact_number");
  
  if(s!=""){
  	var options = {
	  address:s,
      animation: 'fade',
      onTransitionEnd: function() { 
      	  callAjax("MenuCategory","merchant_id="+mtid + "&device_id=" + getStorage("device_id")  );	
      } 
   };	 
     
  cart = [] ; /*clear cart variable*/
  removeStorage("tips_percentage");  
  removeStorage("cc_id");  
  
  dump('clear cart');
  	   	 
	  setStorage("merchant_id",mtid);
   sNavigator.pushPage("menucategory.html", options);
	  	  
  } else{
  	 onsenAlert(   getTrans('Please Enter the Address first.','address_is_required')  );
  }
	
}

function cuisineResults(data)
{		
	var htm='';
	htm+='<ons-list>';
	htm+='<ons-list-header class="list-header trn" data-trn-key="services">Services</ons-list-header>';
	
	if (!empty(data.services)){
		$.each( data.services, function( key, val ) {			
			/*htm+='<ons-list-item modifier="tappable">';
			 htm+='<label class="checkbox checkbox--list-item">';
				htm+='<input type="checkbox" name="delivery_type" class="delivery_type" value="'+key+'" >';
				htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
				htm+=' <span>'+val+'</span>';
			  htm+='</label>';
			htm+='</ons-list-item>';*/
			
   htm+='<ons-list-item modifier="tappable">';
    htm+='<ons-row class="row">';
     htm+='<ons-col class="concat-text" width="10%">';
       htm+='<label class="radio-button checkbox--list-item">';
	     htm+='<input type="radio" name="delivery_type" class="delivery_type" value="'+key+'" >';
	     htm+='<div class="radio-button__checkmark checkbox--list-item__checkmark"></div>';	     
	   htm+='</label>';
	  htm+='</ons-col>';	
	  htm+='<ons-col class="text-left" >'+val+'</ons-col>';
    htm+='</ons-row>';
    htm+='</ons-list-item>';
    
		});
	}	
	
	/*htm+='<ons-list-item modifier="tappable">';
	 htm+='<label class="checkbox checkbox--list-item">';
		htm+='<input type="checkbox" name="delivery_type" class="delivery_type" value="1" >';
		htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
		htm+=' <span class="trn" data-trn-key="delivery_n_pickup" >Delivery & Pickup</span>';
	  htm+='</label>';
	htm+='</ons-list-item>';
	
	htm+='<ons-list-item modifier="tappable">';
	 htm+='<label class="checkbox checkbox--list-item">';
		htm+='<input type="checkbox" name="delivery_type" class="delivery_type" value="2">';
		htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
		htm+=' <span class="trn" data-trn-key="delivery_only">Delivery Only</span>';
	  htm+='</label> ';
	htm+='</ons-list-item>';
	
	htm+='<ons-list-item modifier="tappable">';
	 htm+='<label class="checkbox checkbox--list-item">';
		htm+='<input type="checkbox" name="delivery_type" class="delivery_type" value="3">';
		htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
		htm+=' <span class="trn" data-trn-key="pickup_only">Pickup Only</span>';
	  htm+='</label>  	   '; 
	htm+='</ons-list-item>	';*/
	    
	htm+='<ons-list-header class="list-header trn" data-trn-key="cuisine">Cuisine</ons-list-header>';
	
	$.each( data.cuisine, function( key, val ) {        		  		  
		htm+='<ons-list-item modifier="tappable">';
		 htm+='<label class="checkbox checkbox--list-item">';
			htm+='<input type="checkbox" name="cuisine_type" class="cuisine_type" value="'+key+'">';
			htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
			htm+=' '+val;
		  htm+='</label>'; 
		htm+='</ons-list-item>';
	});	
	
	htm+='</ons-list>';	
	createElement('filter-options-list',htm);	
	
	$(".restaurant_name").attr("placeholder",  getTrans("Enter Restaurant name",'enter_resto_name') );
	
	translatePage();
}

function seguimentosResults(data)
{		
	var htm='';
	htm+='<ons-list>';
	
	/*htm+='<ons-list-item modifier="tappable">';
	 htm+='<label class="checkbox checkbox--list-item">';
		htm+='<input type="checkbox" name="delivery_type" class="delivery_type" value="1" >';
		htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
		htm+=' <span class="trn" data-trn-key="delivery_n_pickup" >Delivery & Pickup</span>';
	  htm+='</label>';
	htm+='</ons-list-item>';
	
	htm+='<ons-list-item modifier="tappable">';
	 htm+='<label class="checkbox checkbox--list-item">';
		htm+='<input type="checkbox" name="delivery_type" class="delivery_type" value="2">';
		htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
		htm+=' <span class="trn" data-trn-key="delivery_only">Delivery Only</span>';
	  htm+='</label> ';
	htm+='</ons-list-item>';
	
	htm+='<ons-list-item modifier="tappable">';
	 htm+='<label class="checkbox checkbox--list-item">';
		htm+='<input type="checkbox" name="delivery_type" class="delivery_type" value="3">';
		htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
		htm+=' <span class="trn" data-trn-key="pickup_only">Pickup Only</span>';
	  htm+='</label>  	   '; 
	htm+='</ons-list-item>	';*/
	    
	htm+='<ons-list-header class="list-header trn" data-trn-key="cuisine">Cuisine</ons-list-header>';
	
	$.each( data.cuisine, function( key, val ) {        		  		  
		htm+='<ons-list-item modifier="tappable">';
		 htm+='<label class="checkbox checkbox--list-item">';
			htm+='<input type="checkbox" name="cuisine_type" class="cuisine_type" value="'+key+'">';
			htm+='<div class="checkbox__checkmark checkbox--list-item__checkmark"></div>';
			htm+=' '+val;
		  htm+='</label>'; 
		htm+='</ons-list-item>';
	});	
	
	htm+='</ons-list>';	
	createElement('filter-seguimentos-list',htm);	
	
	$(".restaurant_name").attr("placeholder",  getTrans("Enter Restaurant name",'enter_resto_name') );
	
	translatePage();
}


function menuCategoryResult(data)
{
	if(!isDebug()){
   		//Tag OneSignal para cada estabelecimento visitado.
		var keyOneSignal = getStorage('merchant_id');
		window.plugins.OneSignal.sendTag(""+keyOneSignal+"", "visita");
	}
	$("#menucategory-page .restauran-title").text(data.restaurant_name);
	/* Atualização João Neves (Pede.ai) Cabeçalho App dentro do menu do estabelecimento */
	$("#menucategory-page .estabelecimento-header2").attr("style",'background-image: url(http://kabrob.com.br/upload/'+data.merchant_bg+'); background-size: 108%; padding-bottom: 42px; box-sizing: border-box; position: fixed; top: 0px; left: 0px; right: 0px;');
	$("#menucategory-page .estabelecimento-header").attr("style",'background-image: url(http://kabrob.com.br/upload/'+data.merchant_bg+'); background-size: cover; box-sizing: border-box; position: relative; top: -42px; left: 0px; right: 0px; height: 165px; z-index: -1;');
	/* Fim da Atualização */
	
	$("#menucategory-page .rating-stars").attr("data-score",data.ratings.ratings);
	initRating();
	$("#menucategory-page .logo-wrap").html('<img src="'+data.logo+'" />')
	
	if ( data.open){
		$("#merchant_open").val(2);
	} else $("#merchant_open").val(1);
		
	if (data.merchant_close_store){
		$("#close_store").val(2);
	} else $("#close_store").val(1);
	
	if (data.has_menu_category==2){
		var htm='';
		htm+='<ons-list>';
		$.each( data.menu_category, function( key, val ) { 			  
              if (val.photo!=""){
			 htm+='<ons-list-item modifier="tappable" class="row" onclick="loadmenu('+
             val.cat_id+','+val.merchant_id+');"><img src="http://kabrob.com.br/upload/'+val.photo+'" class="imgcategoria"></img> '+val.category_name+'</ons-list-item>';
			} else {
				htm+='<ons-list-item modifier="tappable" class="row" onclick="loadmenu('+
				val.cat_id+','+val.merchant_id+');"><img src="'+data.logo+'" class="imgcategoria"></img> '+val.category_name+'</ons-list-item>';
			}

		});	
		htm+='</ons-list>';
		createElement('category-list',htm);	
	} else {
		onsenAlert(  getTrans("This restaurant has not published their menu yet.",'this_restaurant_no_menu') );
	}	
}

function loadmenu(cat_id,mtid)
{			       
	
	/*if ( $("#close_store").val()==2 || $("#merchant_open").val()==1 ){
		onsenAlert( getTrans("This Restaurant Is Closed Now.  Please Check The Opening Times",'restaurant_close') );
		return;
	}*/
	
	var options = {
      animation: 'none',
      onTransitionEnd: function() { 
      	  callAjax("getItemByCategory","cat_id="+cat_id+"&merchant_id="+mtid);
      	  showCartNosOrder();
      } 
   };
   sNavigator.pushPage("menuItem.html", options);
}

function carregarCategoriaEmpresa(cat_id,mtid)
{			       
	
	if ( $("#close_store").val()==2 || $("#merchant_open").val()==1 ){
		onsenAlert( getTrans("This Restaurant Is Closed Now.  Please Check The Opening Times",'restaurant_close') );
		return;
	}
	
  cart = [] ; /*clear cart variable*/
  removeStorage("tips_percentage");  
  removeStorage("cc_id");  
  
  dump('clear cart');

	var options = {
      animation: 'none',
      onTransitionEnd: function() { 
      	  callAjax("getItemByCategory","cat_id="+cat_id+"&merchant_id="+mtid);
      	  showCartNosOrder();
      } 
   };
   sNavigator.pushPage("menuItemEmpresa.html", options);
}

function displayMerchantInfo(data)
{
	if (!empty(data)){
		$("#page-menubycategoryitem #search-text").html(data.category_info.category_name);
		$("#page-menubycategoryitem .restauran-title").text(data.merchant_info.restaurant_name);
		$("#page-menubycategoryitem .rating-stars").attr("data-score",data.merchant_info.ratings.ratings);
		initRating();
		$("#page-menubycategoryitem .logo-wrap").html('<img src="'+data.merchant_info.logo+'" />')			
	}
}

function displayMerchantLogo(data,page_id)
{
	if(!empty(data.merchant_info)){
		$("#"+ page_id +" .logo-wrap").html('<img src="'+data.merchant_info.logo+'" />')		
	}
	if (!empty(data.cart_total)){
		$("#"+ page_id +" .total-amount").html(data.cart_total);
	}
}
function displayMerchantLogo2(logo,total,page_id)
{
	if(!empty(logo)){
	    $("#"+ page_id +" .logo-wrap").html('<img src="'+logo+'" />')		
	}
	if (!empty(total)){
		$("#"+ page_id +" .total-amount").html(total);
	}
	
	var merchant_name=getStorage("merchant_name");	
	if (!empty(merchant_name)){
		$("#"+ page_id +" .restauran-title").html(merchant_name);
	}
}

function displayItemByCategory(data)
{			
	
	dump( "mobile_menu=>"+data.mobile_menu );
	
	$("#page-menubycategoryitem #search-text").html(data.category_info.category_name);
	$("#page-menubycategoryitem .restauran-title").text(data.merchant_info.restaurant_name);
	$("#page-menubycategoryitem .rating-stars").attr("data-score",data.merchant_info.ratings.ratings);
	initRating();
	$("#page-menubycategoryitem .logo-wrap").html('<img src="'+data.merchant_info.logo+'" />')			
	    	
	
	var html='';
	html+='<ons-list class="restaurant-list">';
	$.each( data.item, function( key, val ) { 		 
				
		 if (data.disabled_ordering==2){
		 html+='<ons-list-item modifier="tappable" class="list-item-container" onclick="itemNotAvailable(2)" >';		
		 } else {
			 if (val.not_available==2){
			     html+='<ons-list-item modifier="tappable" class="list-item-container" onclick="itemNotAvailable(1)" >';	
			 } else {
			 	  var single_add_item=getStorage("single_add_item");
			 	  dump("=>"+single_add_item);
			 	  if (val.single_item==2 && single_add_item==2){
			 	  	  item_auto_price="0|";
			 	  	  item_auto_discount="0";
			 	  	  if ( val.prices.length>0){
			 	  	  	  $.each( val.prices, function( key_price, price ) { 
			 	  	  	  	   if (!empty(price.price_discount_pretty)){
			 	  	  	  	   	   //item_auto_price = "'"+price.price+"|'";
			 	  	  	  	   	   item_auto_price = price.price+"|";
			 	  	  	  	   	   item_auto_discount=parseInt(price.price)-parseInt(price.price_discount)
			 	  	  	  	   } else {
			 	  	  	  	   	   //item_auto_price=  "'"+price.price+"|'";
			 	  	  	  	   	   item_auto_price =  price.price+"|";
			 	  	  	  	   }
			 	  	  	  });
			 	  	  }
			 	  	  /*html+='<ons-list-item modifier="tappable" class="list-item-container" onclick="autoAddToCart('+val.item_id+','+item_auto_price+','+item_auto_discount+');"  >';*/
			 	  	  			 	  	 
html+='<ons-list-item modifier="tappable" class="list-item-container"';
html+='onclick="autoAddToCart('+ "'"+val.item_id+"'," +  "'"+item_auto_price+"'," + "'"+item_auto_discount+"'"  +');"  >';
			 	  	  
			 	  } else {
			          html+='<ons-list-item modifier="tappable" class="list-item-container" onclick="loadItemDetails('+val.item_id+','+data.merchant_info.merchant_id+','+data.category_info.cat_id+');"  >';
			 	  }
			 }
		 }
		 
         html+='<ons-row class="row">';
         
         if ( data.mobile_menu==1){
         	
         	html+='<ons-col class="col-image" width="65%">';
                html+='<p class="restauran-title concat-text">'+val.item_name+'</p>';
                html+='<p class="">'+val.item_description+'</p>';   
             html+='</ons-col>';
         	
             html+='<ons-col class="col-image text-right" width="35%">';
              if ( val.prices.length>0){
	                $.each( val.prices, function( key_price, price ) { 
	                   if (!empty(price.price_discount_pretty)){
	                   	   html+='<p class="p-small">'+price.size+' <price class="discount">'+price.price_pretty+'</price>'; 
	                   	   html+='<price>'+price.price_discount_pretty+'</price>';
	                   	   html+='</p>';
	                   } else {
	                   	   html+='<p class="p-small">'+price.size+' <price>'+price.price_pretty+'</price></p>';
	                   }                   
	                });
                }
             html+='</ons-col>';
             
         } else {
         	
             html+='<ons-col class="col-image" width="29%">';
                html+='<div class="logo-wrap3" >';
                  html+='<div class="img_loaded" >';
                  html+='<img src="'+data.merchant_info.logo+'" />';
                  html+='</div>';
                html+='</div>';
             html+='</ons-col>';
             
                html+='<ons-col class="col-description" width="65%" style="border-bottom: 0px solid #333; margin-left: 12px;">';
                html+='<p class="restauran-title concat-text" style="margin-top: 5px;">'+val.item_name+'</p>';
                html+='<p class="" style="margin-top: 5px; font-size: 13px; margin-bottom: 15px;">'+val.item_description+'</p>';   
                                     
                if ( val.prices.length>0){
	                $.each( val.prices, function( key_price, price ) { 
	                   if (!empty(price.price_discount_pretty)){
	                   	   html+='<p class="p-small">'+price.size+' <price class="discount">'+price.price_pretty+'</price>'; 
	                   	   html+='<price>'+price.price_discount_pretty+'</price>';
	                   	   html+='</p>';
	                   } else {
	                   	   html+='<p class="p-small">'+price.size+' <price>'+price.price_pretty+'</price></p>';
	                   }                   
	                });
                }
                                
                if (val.not_available==2){
                	html+='<p>item not available</p>';
                }
                
             html+='</ons-col>';
         }                 
           
         html+='</ons-row>';
        html+='</ons-list-item>';
    });			
    html+='</ons-list>';    
    createElement('menu-list',html);
    
    imageLoaded('.img_loaded');
}

function empty(data)
{
	if (typeof data === "undefined" || data==null || data=="" ) { 
		return true;
	}
	return false;
}

function loadItemDetails(item_id,mtid,cat_id)
{		
		
    if ( $("#close_store").val()==2 || $("#merchant_open").val()==1 ){
		onsenAlert( getTrans("This Restaurant Is Closed Now.  Please Check The Opening Times",'restaurant_close') );
		if(!isDebug()){
		//Tag OneSignal para cada estabelecimento visitado estando fechado.
		var keyOneSignal = getStorage('merchant_id');
		window.plugins.OneSignal.sendTag(""+keyOneSignal+"", "fechado");
		}
		return;
	}
	
	var options = {
      animation: 'slide',
      onTransitionEnd: function() { 
      	  callAjax("getItemDetails","item_id="+item_id+"&merchant_id="+mtid+"&cat_id="+cat_id);
      } 
   };   
   sNavigator.pushPage("itemDisplay.html", options);
}

function displayItem(data)
{		
	$("#page-itemdisplay .item-header").css({
		'background-image':'url('+data.photo+')'
	});
	
	$("#page-itemdisplay .title").html(data.item_name);
	$("#page-itemdisplay .description").html(data.item_description);	
	
	
	if (!empty(data.category_info)){
		$("#page-itemdisplay #search-text").text(data.category_info.category_name);
	}
	
	var htm='';
	
	htm+='<input type="hidden" name="item_id" class="item_id" value="'+data.item_id+'">';	
	htm+='<input type="hidden" name="currency_symbol" class="currency_symbol" value="'+data.currency_symbol+'">';	
	htm+='<input type="hidden" name="discount" class="discount discount_amt" value="'+data.discount+'">';	
	
	htm+='<input type="hidden" name="two_flavors" class="two_flavors" value="'+data.two_flavors+'">';	
	
	if (data.two_flavors==2){
		data.has_price=1;
	}
	
	if ( data.has_price==2){	
		htm+='<ons-list-header class="list-header trn" data-trn-key="price">Price</ons-list-header>';
		var x=0
		$.each( data.prices, function( key, val ) { 				
			if (data.discount>0){
				var discount_price='<price class="discount">'+val.pretty_price;				
				discount_price+='</price>';
				discount_price+='<price>'+val.discounted_price_pretty+'</price>';
				if (x==0){	
					htm+=privatePriceRowWithRadio2('price',
					val.price+'|'+val.size ,
					val.size,
					discount_price,
					'checked="checked"');
				} else {
					htm+=privatePriceRowWithRadio2('price',
					val.price+'|'+val.size,
					val.size,
					discount_price);
				}	
			} else {			
				if (x==0){				
					htm+=privatePriceRowWithRadio('price',
					val.price+'|'+val.size ,
					val.size,
					val.pretty_price,
					'checked="checked"');
				} else {
					htm+=privatePriceRowWithRadio('price',
					val.price+'|'+val.size,
					val.size,
					val.pretty_price);
				}		
			}	
			x++;
		});	
	}
	
	if (!empty(data.cooking_ref)){
		htm+='<ons-list-header class="list-header trn" data-trn-key="cooking_ref">Cooking Preference</ons-list-header>';
		$.each( data.cooking_ref, function( key, val ) { 
			htm+=privateRowWithRadio('cooking_ref',val,val);	
		});		
	}
	
	if (!empty(data.ingredients)){
		htm+='<ons-list-header class="list-header trn" data-trn-key="ingredients">Ingredients</ons-list-header>';
		$.each( data.ingredients, function( key, val ) { 
			htm+=privateRowWithCheckbox('ingredients','ingredients',val,val);	
		});		
	}
	
	var show_addon_description=getStorage("show_addon_description");	
	
	if (!empty(data.addon_item)){
		$.each( data.addon_item, function( key, val ) { 
			htm+='<ons-list-header class="list-header require_addon_'+val.subcat_id+' ">'+val.subcat_name+'</ons-list-header>';
			
			htm+='<input type="hidden" name="require_addon_'+val.subcat_id+'" class="require_addon" value="'+val.require_addons+'" data-id="'+val.subcat_id+'" data-name="'+val.subcat_name+'" >'
			
			if (!empty(val.sub_item)){
				$.each( val.sub_item, function( key2, val2 ) { 				
					  if (val.multi_option == "custom"){					  	 
	                     htm+=subItemRowWithCheckbox(
	                                 val.subcat_id,
	                                 'sub_item', 
	                                 val2.sub_item_id+"|"+val2.price +"|"+val2.sub_item_name,
	                                 val2.sub_item_name,
	                                 val2.price>0?val2.pretty_price:'',
	                                 val.multi_option_val,
	                                 val2.item_description
	                                 );	
	                                 	                     
					  } else if ( val.multi_option == "multiple") { 
					  	 htm+=subItemRowWithCheckboxQty(
					  	             val.subcat_id,
					  	            'sub_item', 
	                                 val2.sub_item_id+"|"+val2.price +"|"+val2.sub_item_name,
	                                 val2.sub_item_name,
	                                 val2.price>0?val2.pretty_price:'');	
	                                 
	                     
	                     if(show_addon_description==1){
		                     if(!empty(val2.item_description)){
		                        htm+='<div class="addon_description small-font-dim">'+val2.item_description+'</div>'; 
		                     }
	                     }
	                     
					  } else {    
                          htm+=subItemRowWithRadio(
                                   val.subcat_id,
                                   "sub_item",
                                   //val2.sub_item_id+"|"+val2.price + "|"+val2.sub_item_name  , 
                                   val2.sub_item_id+"|"+val2.price + "|"+val2.sub_item_name + "|" + val.two_flavor_position  , 
                                   val2.sub_item_name,
                                   val2.price>0?val2.pretty_price:'',
                                   false,
                                   val2.item_description
                                   );                                                           
					  }
				});	
			}
		});	
	}
	
	htm+=cartFooter(data.currency_code);
	
	createElement('item-info',htm);

	setCartValue()
	
	translatePage();
		
}

jQuery(document).ready(function() {	
	
	/*jquery onclick*/
	
	 // fix to autocomplete search address bar
	$(document).on({
	"DOMNodeInserted": function(e){
	console.log(e);
	$(".pac-item span",this).addClass("needsclick");
	}
	}, ".pac-container");
	
	$( document ).on( "click", ".price", function() {
		setCartValue();
	});
	$( document ).on( "change", ".qty", function() {
		setCartValue();
	});
	
	$( document ).on( "change", ".sub_item", function() {
		setCartValue();
	});
	
	$( document ).on( "change", ".subitem-qty", function() {
		setCartValue();
	});
	
	$( document ).on( "click", ".edit-order", function() {
		editOrderInit();
	});
		
	$( document ).on( "click", ".order-apply-changes", function() {
		applyCartChanges();
	});
		
	$( document ).on( "click", ".delete-item", function() {
		var id=$(this).data('id');
		var parent=$(this).parent().parent().parent();		
		parent.remove();
		$(".subitem-row"+id).remove();
	});
		
	$( document ).on( "click", ".sub_item_custom", function() {		
		 var this_obj=$(this);
		 var multi=$(this).data("multi");		 
		 if (empty(multi)){
		 	return;
		 }		 
		 var id=$(this).data("id");		 
		 var total_check=0;		 	
		 $('.sub_item_custom:checked').each(function(){ 
		 	if ( $(this).data("id") == id){
		 		total_check++;
		 	}
		 });		 
		 if (multi<total_check){
		 	onsenAlert( getTrans('Sorry but you can select only','sorry_but_you_can_select') + " "+multi+" "  +
		 	 getTrans('addon','addon') );
		 	this_obj.attr("checked",false);
		 	return;
		 }
	});
	
	$( document ).on( "click", ".transaction_type", function() {
		var transaction_type=$(this).val();		
		
		if(transaction_type=="pickup"){
			$(".delivery_asap_wrap").hide();
		} else {
			$(".delivery_asap_wrap").show();
		}
		
		setStorage('transaction_type',transaction_type);
		
		  var cart_params=JSON.stringify(cart);	
		  if (saveCartToDb()){	
		      cart_params='';
		  }
		    
		  var extra_params= "&delivery_date=" +  $(".delivery_date").val();  
		  if ( !empty($(".delivery_time").val()) ){
			  extra_params+="&delivery_time="+$(".delivery_time").val();
		   }
		  
      	  callAjax("loadCart","merchant_id="+ getStorage('merchant_id')+"&search_address=" + 
      	  encodeURIComponent(getStorage("search_address")) + "&cart="+cart_params +"&transaction_type=" +
      	  getStorage("transaction_type") + extra_params + "&device_id="+ getStorage("device_id") );
			
	});
	
	$( document ).on( "click", ".payment_list", function() {		
		dump( $(this).val() );
		var paypal_card_fee=$(".paypal_card_fee").val();
		
		/*CHECK IF CHANGE IS REQUIRED*/
		if ( $(this).val() == "cod"){
			if ( $(".cod_change_required").val()==2 ){
			   $(".order_change").attr("data-validation","required");
			} else {
				$(".order_change").removeAttr("data-validation");
			}
		} else {
			$(".order_change").removeAttr("data-validation");
		}
		
		switch( $(this).val() )
		{
			case "paypal":
			case "pyp":			  			  
			  if (paypal_card_fee>0){
				  var total_order_plus_fee=parseFloat(getStorage("order_total_raw")) + parseFloat(paypal_card_fee);
				  total_order_plus_fee= number_format(total_order_plus_fee,2);
				  $(".total-amount").html( getStorage("cart_currency_symbol")+" "+total_order_plus_fee);
			  }
			  
			  $(".order-change-wrapper").hide();
			  $(".payon-delivery-wrapper").hide();
			  break;
			 
			case "cod":
			if (paypal_card_fee>0){
				$(".total-amount").html( getStorage("order_total"));
			}
			$(".order-change-wrapper").show();
			$(".payon-delivery-wrapper").hide();			
			break;
			
			case "pyr":			
			if (paypal_card_fee>0){
				$(".total-amount").html( getStorage("order_total"));
			}
			$(".order-change-wrapper").hide();
			$(".payon-delivery-wrapper").show();
			break;
			
			case "ocr":
						
			var options = {
		      animation: 'slide',
		      onTransitionEnd: function() { 						      	  		      	  
		      	  var params="merchant_id=" +  getStorage("merchant_id") ;
		      	  params+="&client_token="+getStorage("client_token");
			      callAjax("getMerchantCClist",params);
			      translatePage();
		      } 
		    };   
		    sNavigator.pushPage("cclist.html", options);		 
			
			break;
						
			default:
			if (paypal_card_fee>0){
				$(".total-amount").html( getStorage("order_total"));
			}
			$(".order-change-wrapper").hide();
			$(".payon-delivery-wrapper").hide();
			break;
		}
	});
	
	$( document ).on( "click", ".logo-wrap img", function() {
		var page = sNavigator.getCurrentPage();	
		dump("pagename=>"+page.name);		
		if ( page.name=="merchantInfo.html"){			
			return;
		}
		
		var options = {
	      animation: 'none',
	      onTransitionEnd: function() { 	 	      	  
	      	  displayMerchantLogo2( 
		      	     getStorage("merchant_logo") ,
		      	     '' ,
		      	     'page-merchantinfo'
		      );	  		      
		      callAjax("getMerchantInfo","merchant_id="+ getStorage('merchant_id'));  		      
	      } 
	    };     
		
		var found=false;
		var _pages = sNavigator.getPages();
		dump( _pages.length );
		if ( _pages.length>0){
			$.each( _pages, function( key, val ) { 	
				if (!empty(val)){
					dump(val.name);
					if ( val.name=="merchantInfo.html"){
						dump('found');
						found=true;
						//sNavigator.resetToPage("merchantInfo.html",options);			
						sNavigator.popPage();
					}
				}
			});	
		}
		
		if (found){
			dump('exit');
			return;
		}
						
	    sNavigator.pushPage("merchantInfo.html", options);						
	});
		
	$( document ).on( "click", ".setAddress", function() {		
		var address=$(this).data("address");		
		var address_split=address.split("|");
		dump(address_split);
		if ( address_split.length>0){
			$(".street").val( address_split[0] );
			$(".city").val( address_split[1] );
			$(".state").val( address_split[2] );
			$(".zipcode").val( address_split[3] );
			$(".location_name").val( address_split[4] );			
			
			var number='';
			if (!empty(address_split[5])){
				number=address_split[5];								
				//number=number.replace("+","");				
			}
			
			$(".contact_phone").val( number );
			
			var complete_address = address_split[0];
			complete_address+=" "+ address_split[1];
			complete_address+=" "+ address_split[2];
			complete_address+=" "+ address_split[3];
			
			$(".delivery-address-text").html( complete_address ); 
			$(".google_lat").val( '' );	
			$(".google_lng").val( '' );	
			$(".formatted_address").val( '' );			
			
			dialogAddressBook.hide();
			
			sNavigator.popPage({cancelIfRunning: true}); //back button
			
		} else {
			onsenAlert(  getTrans("Error: cannot set address book",'cannot_set_address')  );
			dialogAddressBook.hide();
		}
	});
	
}); /*end ready*/

function setCartValue()
{	
	/*set the default total price based on selected price*/
	var selected_price=parseFloat($(".price:checked").val());
	var discount= parseFloat( $(".discount_amt").val() );	
	if (isNaN(discount)){
		discount=0;
	}
	
	if (isNaN(selected_price)){
		selected_price=0;
	}	
	
	dump("discount=>"+discount);
	dump("selected_price=>"+selected_price);
	var qty=parseFloat($(".qty").val());
	var total_value=qty* (selected_price-discount);    
	
	//adon	
	dump('addon totalx');	
	var addon_total=0;
	
	var addon_prices = [];
	
	$('#page-itemdisplay .sub_item:checkbox:checked').each(function(){        		
        var addo_price=explode("|",$(this).val());        
        if ( $(this).data("withqty")==2 ){
        	var p=$(this).parent().parent().parent();        	
        	var qtysub= parseFloat(p.find('.subitem-qty').val());
        	        	        
        	addon_total+=qtysub* parseFloat(addo_price[1]);
        	//addon_prices.push(addon_total);
        } else {        	
        	addon_total+=qty* parseFloat(addo_price[1]);
        	//addon_prices.push(addon_total);
        }        
    });
       
    $('#page-itemdisplay .sub_item:radio:checked').each(function(){        		
    	    	
        var addo_price=explode("|",$(this).val());       

        dump(addo_price);
        dump(addo_price[1]);
               
        addon_total+=qty * parseFloat(addo_price[1]);
        addon_prices.push( parseFloat(addo_price[1]) );
    });
        
    total_value+=addon_total;
    
    dump("total_value =>"+total_value);    
    if ( $(".two_flavors").val()==2 ){
    	dump("two_flavors");
    	dump(addon_prices);
    	total_value = Math.max.apply(Math,addon_prices); 
    	dump('get the highest value => ' + total_value );
    	total_value = parseInt($("#page-itemdisplay .qty").val()) * total_value;	
    }
    
    //$(".total_value").html(  $(".currency_symbol").val() +" "+ total_value);
    $(".total_value").html( prettyPrice(total_value)  );
}

function addCartQty(bolean)
{	
	var qty=parseInt($("#page-itemdisplay .qty").val());	
	if ( bolean==2){
		qty=qty+1;
	} else {
		qty=qty-1;
	}
	if ( qty>1){
	    $("#page-itemdisplay .qty").val(qty)
	} else {
		$("#page-itemdisplay .qty").val(1)
	}
	setCartValue();
}
	
function addToCart()
{		
	var proceed=true;
	/*check if sub item has required*/
	fbq('track', 'AddToCart');
	if ( $(".require_addon").exists()){
		$(".small-red-text").remove();	
		$('.require_addon').each(function () {
			if ( $(this).val()==2 ) {
				var required_addon_id=$(this).data("id");
	   	   	   	var required_addon_name=$(this).data("name");
	   	   	   	var required_addon_selected=$(".sub_item_name_"+required_addon_id+":checked").length; 
	   	   	   	if ( required_addon_selected <=0){
	   	   	   		proceed=false;
	   	   	   			   	   	  
	   	   	   		var err_msg= getTrans("You must select at least one addon","select_addon") +  " - "+ required_addon_name;
	   	   	   		   	   	   		
	   	   	   		$(".require_addon_"+required_addon_id).after( 
					"<span class=\"small-red-text\">"+err_msg 
					+'</span');
					onsenAlert(err_msg);
	   	   	   	}
			}
		});
	}

	dump("proceed=>"+proceed);
	if (!proceed){
		return;
	}	
	
	var sub_item=[];
	var cooking_ref=[];	
	var ingredients=[];
	var item_id='';
	var qty=0;
	var price=0;
	var order_notes='';
	var discount='';
	//dump('add to cart');
	//var params = $( "#page-itemdisplay .frm-foodorder").serialize();
	var params = $( "#page-itemdisplay .frm-foodorder").serializeArray();	
	if (!empty(params)){
		$.each( params, function( key, val ) { 			
			/*item*/
			if (val.name=="item_id"){
				item_id=val.value;
			}			
			if (val.name=="qty"){
				qty=val.value;
			}
			if (val.name=="price"){
				price=val.value;
			}
			/*sub item*/
			/*if ( val.name=="sub_item"){				
				sub_item[sub_item.length]={"value":val.value};
			}*/
			/*cooking_ref*/
			if ( val.name=="cooking_ref"){				
				cooking_ref[cooking_ref.length]={"value":val.value};
			}
			/*ingredients*/
			if ( val.name=="ingredients"){				
				ingredients[ingredients.length]={"value":val.value};
			}					
			if ( val.name=="order_notes"){				
				order_notes=val.value;
			}							
			if ( val.name=="discount"){				
				discount=val.value;
			}				
		});	
				
		/*get sub item */
		
		if ( $(".two_flavors").val()==2 ){			
			var sub_item_selected=$(".sub_item:checked").length; 			
			if ( sub_item_selected<2){
   	   	  	  onsenAlert(  getTrans("You must select price for left and right flavor",'two_flavor_required') ); 
   	   	      return;
   	   	   }   	   
   	   	   
   	   	   var xx=0; var addon_price_array=[];
   	   	   $.each( $(".sub_item:checked") , function( key, val ) { 	
				var parent=$(this).parent().parent().parent();		
				var sub_item_qty = parent.find(".subitem-qty").val()
				if (empty(sub_item_qty)){
					sub_item_qty="itemqty";
				}
				var subcat_id=$(this).data("id");	

				var addon_price=$(this).val();
				addon_price=addon_price.split("|");				
				
			
				if (!empty(addon_price[3])){
				   addon_price_array[xx]=addon_price[1];
				} else {
				   addon_price_array[xx]=0;
				}
							
				sub_item[sub_item.length] = {
					'subcat_id':subcat_id,
					'value':$(this).val(),
					'qty':sub_item_qty
				};
				
				xx++;
			});	
			
			dump(addon_price_array);
			/*var largest = addon_price_array.reduce(function(x,y){
			       return (x > y) ? x : y;
			});*/
			largest = Math.max.apply(Math,addon_price_array); 
			
			dump("largest price => "+largest);
			price=largest;
   	   	   
		} else {
			$.each( $(".sub_item:checked") , function( key, val ) { 	
				var parent=$(this).parent().parent().parent();		
				var sub_item_qty = parent.find(".subitem-qty").val()
				if (empty(sub_item_qty)){
					sub_item_qty="itemqty";
				}
				var subcat_id=$(this).data("id");						
				sub_item[sub_item.length] = {
					'subcat_id':subcat_id,
					'value':$(this).val(),
					'qty':sub_item_qty
				};
			});	
		}
			
		cart[cart.length]={		  
		  "item_id":item_id,
		  "qty":qty,
		  "price":price,
		  "sub_item":sub_item,
		  "cooking_ref":cooking_ref,
		  "ingredients":ingredients,
		  'order_notes': order_notes,
		  'discount':discount
		};
		
		var cart_value={		  
		  "item_id":item_id,
		  "qty":qty,
		  "price":price,
		  "sub_item":sub_item,
		  "cooking_ref":cooking_ref,
		  "ingredients":ingredients,
		  'order_notes': order_notes,
		  'discount':discount
		};
				
		if( saveCartToDb() ){
		   callAjax("addToCart", "cart="+ JSON.stringify(cart_value) + "&device_id=" + getStorage("device_id") );
		   sNavigator.popPage({cancelIfRunning: true}); //back button
		} else {
			sNavigator.popPage({cancelIfRunning: true}); //back button
			toastMsg(  getTrans("Item added to cart",'item_added_to_cart') );
		}
		
		showCartNosOrder();
	}
}

function showCart()
{
	dump('showCart');
	var options = {
      animation: 'none',
      onTransitionEnd: function() { 
      	
      	  var cart_params=JSON.stringify(cart);       	        	  
      	  if (saveCartToDb()){
      	  	  var cart_params='';
      	  }      	  
      	  
      	  if ( empty(getStorage("tips_percentage")) ){
      	  	   setStorage("tips_percentage",0);
      	  }
      	  
      	  var remove_tips='';
      	  if(!empty(getStorage("remove_tips"))){
      	  	  remove_tips=getStorage("remove_tips");
      	  }
      	  
      	  var tips_percentage='';
      	  if(!empty(getStorage("tips_percentage"))){
      	  	  tips_percentage=getStorage("tips_percentage");
      	  }
      	      	        	        	        	 
      	  var params="merchant_id="+ getStorage('merchant_id');
      	  params+="&search_address="+encodeURIComponent(getStorage("search_address"));
      	  params+="&cart="+cart_params;
      	  
      	  if(empty(getStorage("transaction_type"))){      	  	
      	  	//alert(getStorage("merchant_services")); 
      	  	switch (getStorage("merchant_services"))
      	  	{
      	  		case 3:
      	  		case 6:
      	  		case "3":
      	  		case "6":
      	  		params+="&transaction_type=pickup";
      	  		setStorage('transaction_type','pickup');
      	  		break;
      	  		      	  		
      	  		case 7:
      	  		case "7":
      	  		params+="&transaction_type=dinein";
      	  		setStorage('transaction_type','dinein');
      	  		break;
      	  		
      	  		default:
      	  		params+="&transaction_type=delivery";
      	  		break;
      	  	}
      	  } else {
      	  	params+="&transaction_type=" + getStorage("transaction_type");
      	  }      	  
      	  
      	  
      	  params+="&device_id="+ getStorage("device_id");
      	  params+="&tips_percentage=" + tips_percentage;
      	  params+="&remove_tips=" + remove_tips;
      	        	 
      	  callAjax("loadCart",params);
      } 
   };     
   sNavigator.pushPage("cart.html", options);
}

function showCartNosOrder()
{
	dump('showCartNosOrder');
	dump(  cart.length );
	if ( cart.length>0 ){		
		//$(".cart-num").show();	    
		$(".cart-num").css({ "display":"inline-block","position":"absolute","margin-left":"-10px" });
		$(".cart-num").text(cart.length);
	} else {
		$(".cart-num").hide();
	}
}

function displayCart(data)
{	
	// display merchant logo
	displayMerchantLogo(data,'page-cart');
	
	var htm='';	
	
	htm+='<input type="hidden" name="validation_msg" class="validation_msg" value="'+data.validation_msg+'">';	
	htm+='<input type="hidden" name="required_time" class="required_time" value="'+data.required_time+'">';	
		
	/*set storage merchant logo*/
    setStorage("merchant_logo",data.merchant_info.logo);
    setStorage("order_total",data.cart.grand_total.amount_pretty); 
    
    setStorage("order_total_raw",data.cart.grand_total.amount);
    setStorage("cart_currency_symbol",data.currency_symbol);
    
    setStorage("order_sub_total_raw",data.cart.sub_total.amount);
    
    /*for pts computation refference*/
    setStorage("cart_sub_total", data.cart.sub_total.amount );
    if(!empty(data.cart.delivery_charges)){
       setStorage("cart_delivery_charges", data.cart.delivery_charges.amount );
    }
    if(!empty(data.cart.packaging)){
       setStorage("cart_packaging", data.cart.packaging.amount );
    }
    if(!empty(data.cart.tax)){
       //setStorage("cart_tax_amount", data.cart.tax.amount );
       setStorage("cart_tax", data.cart.tax.tax );
    }
    	
	if (!empty(data.delivery_date)){
	    $(".delivery_date").val( data.delivery_date);
	}
	
	if (!empty(data.cart)){
		
		if(!empty(data.cart.grand_total.amount_pretty)){
		   $(".total-amount").html(data.cart.grand_total.amount_pretty);
		}
		
		var xx=1;
		$.each( data.cart.cart, function( key, val ) { 
			 if (val.discount>0){
			 	 htm+=tplCartRowNoBorder(
					 val.item_id,
					 val.item_name,
					 val.price+'|'+val.size,
					 val.total_pretty,
					 val.qty,
					 'price', 
					 val.size,
					 xx,
					 val.discounted_price,
					 val.discount
					 );
			 	
			 } else {
			   htm+=tplCartRowNoBorder(
					 val.item_id,
					 val.item_name,
					 val.price+'|'+val.size,
					 val.total_pretty,
					 val.qty,
					 'price', 
					 val.size,
					 xx,
					 val.price,
					 val.discount
					 );
			 }	 
			 
			 if ( !empty(val.order_notes)){
			 		htm+=tplCartRowHiddenFields( val.order_notes ,
                        val.order_notes , 
                        'order_notes',
                        xx ,
                        'row-no-border' );
			 }
			 
			 if (!empty(val.cooking_ref)){
			 	htm+=tplCartRowHiddenFields( val.cooking_ref ,
			 	                        val.cooking_ref , 
			 	                        'cooking_ref',
			 	                        xx ,
			 	                        'row-no-border' );
			 }
			 
			 if (!empty(val.ingredients)){
			 	//htm+='<ons-list-header class="subitem-row'+xx+'">Ingredients</ons-list-header>';			 	
			 	htm+='<ons-list-header class="subitem-row'+xx+'">'+getTrans('Ingredients','ingredients')+'</ons-list-header>';
			 	$.each( val.ingredients, function( key_ing, val_ing ) { 			 	
			 		 htm+=tplCartRowHiddenFields( val_ing , val_ing ,'ingredients', xx ,'row-no-border' );
			 	});	
			 }
			 
			 /*if (!empty(val.sub_item)){
			 	 var x=0
				 $.each( val.sub_item , function( key_sub, val_sub ) {
				 	 if (x==0){
				 	     htm+='<ons-list-header>'+val_sub.category_name+'</ons-list-header>';
				 	 }				 	 
				 	 htm+=tplCartRowNoBorderSub(
				 	        val_sub.sub_item_id,
				 	        val_sub.sub_item_name,
				 	        val_sub.price, 
				 	        val_sub.total_pretty,
				 	        val_sub.qty ,
				 	        'sub_item',
				 	        xx
				 	        );
				 	 x++;
				 });	
			 }*/			 			 
			 
			 /*sub item*/
			 if (!empty(val.sub_item)){
			 	var x=0;
			 	$.each( val.sub_item , function( key_sub, val_sub ) {			 		 
				 	 //htm+='<ons-list-header class="subitem-row'+xx+'">'+key_sub+'</ons-list-header>';
				 	 htm+='<ons-list-header class="subitem-row'+xx+'">'+val_sub[0]['category_name']+'</ons-list-header>';
				 	 $.each( val_sub  , function( key_sub2, val_sub2 ) {			 		 
				 	      dump(val_sub2);	
				 	      if ( val_sub2.qty =="itemqty"){
				 	      	 subitem_qty=val.qty;
				 	      } else {
				 	      	 subitem_qty=val_sub2.qty;
				 	      }				 	      
				 	      
				 	      htm+=tplCartRowNoBorderSub(
				 	        val_sub2.subcat_id,
				 	        val_sub2.sub_item_id,
				 	        val_sub2.sub_item_name,
				 	        val_sub2.price, 
				 	        val_sub2.total_pretty,
				 	        subitem_qty ,
				 	        val_sub2.qty,
				 	        xx
				 	        );
				 	     x++;
				 	 });
			 	});
			 }
			 
			 htm+='<ons-list-item class="grey-border-top line-separator" style="box-shadow: none; margin-bottom: 0px;"></ons-list-item>';	
			 xx++;
		});	
								
		htm+='<ons-list-item class="line-separator" style="box-shadow: none; margin-bottom: 0px;"></ons-list-item>';	
		
		if (!empty(data.cart.discount)){			
			htm+=tplCartRow(data.cart.discount.display, '('+data.cart.discount.amount_pretty+')' ,'price-normal' );
		}				
		if (!empty(data.cart.sub_total)){
			htm+=tplCartRow( getTrans('Sub Total','sub_total') , data.cart.sub_total.amount_pretty ,'price-normal');
		}		
		if (!empty(data.cart.delivery_charges)){
			htm+=tplCartRow( getTrans('Delivery Fee','delivery_fee') , data.cart.delivery_charges.amount_pretty, 'price-normal');
		}		
		if (!empty(data.cart.packaging)){
			htm+=tplCartRow( getTrans('Packaging','packaging') , data.cart.packaging.amount_pretty, 'price-normal');
		}		
		if (!empty(data.cart.tax)){
			htm+=tplCartRow(data.cart.tax.tax_pretty, data.cart.tax.amount, 'price-normal');
		}		
		
		if (!empty(data.cart.tips)){			
			htm+=tplCartRow(data.cart.tips.tips_percentage_pretty, data.cart.tips.tips_pretty, 'price-normal');
			$(".tip_amount").removeClass("trn");
			$(".tip_amount").html( data.cart.tips.tips_percentage_pretty );
		} else {
			$(".tip_amount").addClass("trn");
			$(".tip_amount").html( getTrans("Tip Amount","tip_amount") );
		}
		
		if (!empty(data.cart.grand_total)){
			htm+=tplCartRow('<b class="trn" data-trn-key="total">Total</b>', data.cart.grand_total.amount_pretty );
		}		
		
	}

	var transaction_type=getStorage("transaction_type");
	if (empty(transaction_type)){	
		transaction_type='delivery';
	}
	dump("transaction_type=>"+transaction_type);
	setStorage('transaction_type',transaction_type);
		
	htm+='<ons-list-header class="trn" data-trn-key="delivery_options">Delivery Options</ons-list-header>';
	/*htm+=privateRowWithRadio('transaction_type','delivery','Delivery');
	htm+=privateRowWithRadio('transaction_type','pickup','Pickup');*/		
	
	/*fixed transaction type*/
	
	dump("services =>"+data.merchant_info.service);
	
	switch (data.merchant_info.service)
	{
		case 1:
		case "1":
		   htm+=privateRowWithRadio('transaction_type','delivery', getTrans('Delivery','delivery') );
		   htm+=privateRowWithRadio('transaction_type','pickup',  getTrans('Pickup','pickup') );
		break;
		
		case 2:
		case "2":
		   htm+=privateRowWithRadio('transaction_type','delivery', getTrans('Delivery','delivery') );
		break;
		
		case 3:
		case "3":
		   transaction_type='pickup';
		   setStorage('transaction_type',transaction_type);
		   htm+=privateRowWithRadio('transaction_type','pickup',  getTrans('Pickup','pickup') );
		break;
		
		case 4:
		case "4":		    
			htm+=privateRowWithRadio('transaction_type','delivery', getTrans('Delivery','delivery') );
		    htm+=privateRowWithRadio('transaction_type','pickup',  getTrans('Pickup','pickup') );
		    htm+=privateRowWithRadio('transaction_type','dinein',  getTrans('Dinein','dinein') );
		break;
		
		case 5:
		case "5":
			htm+=privateRowWithRadio('transaction_type','delivery', getTrans('Delivery','delivery') );	    
		    htm+=privateRowWithRadio('transaction_type','dinein',  getTrans('Dinein','dinein') );
		break;
		
		case 6:
		case "6":
			htm+=privateRowWithRadio('transaction_type','pickup',  getTrans('Pickup','pickup') );
		    htm+=privateRowWithRadio('transaction_type','dinein',  getTrans('Dinein','dinein') );
		break;
		
		case 7:
		case "7":
		    transaction_type='dinein';
		    setStorage('transaction_type',transaction_type);
			htm+=privateRowWithRadio('transaction_type','dinein',  getTrans('Dinein','dinein') );
		break;
		
		default:		    
			htm+=privateRowWithRadio('transaction_type','delivery', getTrans('Delivery','delivery') );
		    htm+=privateRowWithRadio('transaction_type','pickup',  getTrans('Pickup','pickup') );
		break;
	}
		
	createElement('cart-item',htm);
	
	//$('.transaction_type[value="' + transaction_type + '"]').prop('checked', true);
	$.each( $(".transaction_type") , function() {		
		if ( $(this).val()==transaction_type ){
			$(this).attr("checked",true);
		}
	});		
	
	/*if ( transaction_type=="delivery"){
		$(".delivery_time").attr("placeholder",  getTrans("Delivery Time",'delivery_time') );
		$(".delivery_asap_wrap").show();
	} else {
		$(".delivery_time").attr("placeholder", getTrans("Pickup Time",'pickup_time') );
		$(".delivery_asap_wrap").hide();
	}*/
	switch(transaction_type)
	{
		case "pickup":
			$(".delivery_time").attr("placeholder", getTrans("Pickup Time",'pickup_time') );
			$(".delivery_asap_wrap").hide();
		break;
		
		case "dinein":
		   $(".delivery_time").attr("placeholder", getTrans("Dine in time",'dinein_time') );
		   $(".delivery_asap_wrap").hide();
		break;
		
		default:
			$(".delivery_time").attr("placeholder",  getTrans("Delivery Time",'delivery_time') );
			$(".delivery_asap_wrap").show();
		break;
	}
	
	
	/*loyalty points*/
	if (data.has_pts==2){		
		setStorage("earned_points", data.points );
		$(".pts_earn_label").show();
		$(".pts_earn_label").html(data.points_label);
	} else {
		$(".pts_earn_label").hide();
		removeStorage("earned_points");
	}
	
	initMobileScroller();
	translatePage();
}

function editOrderInit()
{
	$("#page-cart .numeric_only").show();
	$(".order-apply-changes").show();
	$(".edit-order").hide();
	$(".qty-label").hide();
	$(".row-del-wrap").show();
	
	var x=1;
	$.each( $(".item-qty") , function( key, val ) {
		$.each( $(".subitem-qty"+x) , function( key2, val2 ) {
			if ( $(this).data("qty")!="itemqty"){
				$(this).show();
			}
		});
		x++;
	});
}

function applyCartChanges()
{	
	$("#page-cart .numeric_only").hide();
	$(".order-apply-changes").hide();
	$(".edit-order").show();
	$(".qty-label").show();
	$(".subitem-qty").hide();
	$(".row-del-wrap").hide();
	
	dump( "qty L=>"+ $(".item-qty").length );
	if (!empty( $(".item-qty") )){
		cart=[];		
		var x=1;
		$.each( $(".item-qty") , function( key, val ) { 	

			var x=$(this).data("rowid");
			dump("rowid=>"+x);
			
			var sub_item=[];
			var ingredients=[];
			var cooking_ref=[];	
			var order_notes='';
			var discount='';
									
			/*$.each( $(".subitem-qty"+x) , function( key2, val2 ) {
				sub_item[sub_item.length]={
				  'value': $(".sub_item_id"+x).val() + "|" + $(".sub_item_price"+x).val() +'|' + $(".sub_item_name"+x).val()
			    };					    			  
			});*/			

			if ( $(".ingredients"+x).exists() ){				
		    	ingredients[ingredients.length]={
		    		'value': $(".ingredients"+x).val()
		    	};
		    }
		    		    
		    if ( $(".cooking_ref"+x).exists() ){
		    	cooking_ref[cooking_ref.length]={
		    		'value': $(".cooking_ref"+x).val()
		    	};
		    }
		    
		    if ( $(".order_notes"+x).exists() ){
		    	/*order_notes[order_notes.length]={
		    		'value': $(".order_notes"+x).val()
		    	};*/
		    	order_notes=$(".order_notes"+x).val();
		    }
		    		    
		    /*get sub item*/		    
		    $.each( $(".subitem-qty"+x) , function( key2, val2 ) { 		    	 
		    	 subqty = $(this).data("qty");
		    	 if ( $(this).data("qty") != "itemqty"){
		    	 	subqty = $(this).val();
		    	 }
		    	 var parent=$(this).parent().parent();		 
		    	 var subcat_id=parent.find(".subcat_id").val();   	 
		    	 var subcat_value= parent.find(".sub_item_id").val()+'|'+
		    	 parent.find(".sub_item_price").val()+'|'+parent.find(".sub_item_name").val();
		    	 
		    	 sub_item[sub_item.length]={
		    	 	 'qty':subqty,
		    	 	 'subcat_id': subcat_id ,
		    	 	 'value': subcat_value
		    	 };
		    });		    		    			    				
			cart[cart.length]={
			   'item_id':$(".item_id"+x).val(),
			   'qty': $(this).val(),
			   'price': $(".price"+x).val(),
			   "sub_item":sub_item,
			   'cooking_ref': cooking_ref ,
			   "ingredients":ingredients,
			   "order_notes":order_notes,
			   "discount":$(".discount"+x).val(),
			};
			x++;
		});	
		
		dump('updated cartx');
		dump(cart);
								
		var cart_params=JSON.stringify(cart);      
		
		var extra_params= "&delivery_date=" +  $(".delivery_date").val();  
		if ( !empty($(".delivery_time").val()) ){
			extra_params+="&delivery_time="+$(".delivery_time").val();
		}
		
		if ( empty(getStorage("tips_percentage")) ){
	       setStorage("tips_percentage",0);
	    }
	    
      	callAjax("loadCart","merchant_id="+ getStorage('merchant_id')+"&search_address=" + 
      	  encodeURIComponent(getStorage("search_address")) + "&update_cart="+ encodeURIComponent(cart_params) +"&transaction_type=" + 
      	  getStorage("transaction_type") + extra_params  + "&device_id="+ getStorage("device_id") +"&tips_percentage=" + getStorage("tips_percentage") );
		
	}
}

function checkOut()
{	
	fbq('track', 'InitiateCheckout');
	var validation_msg=$(".validation_msg").val();
	dump(validation_msg);
	dump(cart);
	if ( cart.length<1){
		onsenAlert( getTrans("Your cart is empty",'your_cart_is_empty') );
		return;
	}
	
	if ( validation_msg!="" ){
		dump('d2');
		onsenAlert(validation_msg);
		return;
	}		
	//var tr_type=getStorage("transaction_type");
	var tr_type = $(".transaction_type:checked").val();
	dump("tr_type=>"+tr_type);
	
	if ( tr_type =="pickup"){
		if ( $(".delivery_time").val()==""){
			onsenAlert(  getTrans("Pickup time is required",'pickup_time_is_required') );
			return;
		}
	}
	
	if ( tr_type =="dinein"){
		if ( $(".delivery_time").val()==""){
			onsenAlert(  getTrans("Dinein time is required",'dinein_time_is_required') );
			return;
		}
	}
	
	if ( $(".required_time").val()==2){
		if ( $(".delivery_time").val() ==""){			
			if ( $(".delivery_asap:checked").length<=0){
				onsenAlert( tr_type+ " "+ getTrans('time is required','time_is_required') );
				return;
			}
		}
	}
		    
    var extra_params= "&delivery_date=" +  $(".delivery_date").val();  
	if ( !empty($(".delivery_time").val()) ){
		extra_params+="&delivery_time="+$(".delivery_time").val();
	}			
	
	extra_params+="&delivery_asap="+ $(".delivery_asap:checked").val();
	
	extra_params+="&client_token="+getStorage("client_token");
	//extra_params+="&transaction_type2=" + $(".transaction_type:checked").val();
	
    callAjax("checkout","merchant_id="+ getStorage('merchant_id')+"&search_address=" + 
      	  encodeURIComponent(getStorage("search_address")) + "&transaction_type=" + 
      	  getStorage("transaction_type") + extra_params );	
}

function clientRegistration()
{
	$.validate({ 	
	    form : '#frm-checkoutsignup',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	    
	    onSuccess : function() {     	

	      if ($('.iagree-wrap').is(':visible')) {	
		      var iagree = $(".iagree:checked").val();	
		      if(empty(iagree)){
		      	 onsenAlert( getTrans("You must agree to terms & conditions",'agree_terms') );
		      	 return;
		      }
	      }
	      
	      // save mobile number
	      setStorage("customer_contact_number",  $(".contact_phone").val()  );	     
	    	     
	      var params = $( "#frm-checkoutsignup").serialize();	      
	      params+="&transaction_type=" +  getStorage("transaction_type") ;
	      params+="&device_id="+ getStorage("device_id");
	      
	      if (isDebug()){
	      	  params+="&device_platform=Android";
	      } else {
	      	  params+="&device_platform="+ device.platform;
	      }	
	      
	      callAjax("signup",params);	       
	      return false;
	    }  
	});
}

function clientShipping()
{	
	
	//if ( empty( $(".street").val() )){
	if ( empty( $(".city").val() )){
		toastMsg( getTrans("Delivery address is required",'delivery_address_required') );
		return;
	}
	
	$.validate({ 	
	    form : '#frm-shipping',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	    
	    onSuccess : function() {  
	       var params = $( "#frm-shipping").serialize();			      	       
	       setStorage('shipping_address',params);
	       dump(params);	       
	       var options = {
		      animation: 'slide',
		      onTransitionEnd: function() { 						      	  
		      	  displayMerchantLogo2( 
		      	     getStorage("merchant_logo") ,
		      	     getStorage("order_total") ,
		      	     'page-paymentoption'
		      	  );
		      	  var params="merchant_id="+ getStorage("merchant_id");
		      	  params+="&street="+$(".street").val();
		      	  params+="&city="+$(".city").val();
		      	  params+="&state="+$(".state").val();
		      	  params+="&zipcode="+$(".zipcode").val();
		      	  params+="&location_name="+$(".location_name").val();
		      	  params+="&save_address="+$('.save_address:checked').val();
		      	  params+="&transaction_type=" +  getStorage("transaction_type") ;
		      	  params+="&client_token="+ getStorage('client_token');
		      	  
		      	  callAjax("getPaymentOptions",params);
		      } 
		    };   
		    sNavigator.pushPage("paymentOption.html", options);		       
	       return false;
	    }  
	});
}

function displayPaymentOptions(data)
{
	var htm='';
	$.each( $(data.details.payment_list) , function( key, val ) { 			
		dump(val);
		htm+=tplPaymentList('payment_list', val.value, val.label, val.icon);
	});		
	createElement('payment-list',htm);
	
	var htm='';
	if (data.details.pay_on_delivery_flag==1){
		$.each( $(data.details.pay_on_delivery_list) , function( key, val ) { 			
		    //dump(val);
		    htm+=tplPaymentProvider('payment_provider_name', val.payment_name, val.payment_name, val.payment_logo);
	    });		    
	    createElement('payon-deliver-list',htm);
	}
}

function placeOrder()
{	
	fbq('track', 'Purchase', {value: '3.00', currency:'BRL'});
	if ( $('.payment_list:checked').length > 0){
		
		var selected_payment=$('.payment_list:checked').val();
		dump(selected_payment);
		if ( selected_payment=="pyr"){
			dump( $('.payment_provider_name:checked').length );
			if ( $('.payment_provider_name:checked').length <= 0){
				onsenAlert( getTrans("Please select payment provider",'please_select_payment_provider') );
				return;
			}
		}
		
		if ( selected_payment=="ocr"){
			if ( empty( getStorage("cc_id") )){
				onsenAlert( getTrans("Please select credit card",'please_select_cc') );
				return;
			}
		}
		
		/*if ( selected_payment=="cod"){
			if ( $(".order_change").val()=="" ){
				onsenAlert( getTrans("Change is required",'change_is_required') );
				return;
			}
		}*/
		
		
		var params = $( "#frm-paymentoption").serialize();	
		var cart_params = JSON.stringify(cart);		
		
		if ( saveCartToDb() ){
			cart_params=''; 
		}		
		
		var extra_params= "&delivery_date=" +  $(".delivery_date").val();  
		if ( !empty($(".delivery_time").val()) ){
			extra_params+="&delivery_time="+$(".delivery_time").val();
		}		
		
		extra_params+="&delivery_asap="+ $(".delivery_asap:checked").val();		
		extra_params+="&formatted_address="+ $(".formatted_address").val();	
		extra_params+="&google_lat="+ $(".google_lat").val();	
		extra_params+="&google_lng="+ $(".google_lng").val();
		
		//extra_params+="&payment_method="+ $(".payment_list:checked").val();
		//extra_params+="&order_change="+ $(".order_change").val();
		extra_params+="&"+getStorage("shipping_address") ;
		extra_params+="&client_token="+ getStorage('client_token');
		extra_params+="&search_address="+ urlencode(getStorage('search_address'));
		/*pts*/
		extra_params+="&earned_points="+ getStorage('earned_points');
		extra_params+="&device_id="+ getStorage('device_id');
		extra_params+="&"+params;	
				
		/*tips*/
		if ( empty(getStorage("tips_percentage")) ){
	        setStorage("tips_percentage",0);
	    }	    
	    extra_params+="&tips_percentage="+ getStorage('tips_percentage');
	    
	    if ( selected_payment=="ocr"){
	    	extra_params+="&cc_id="+ getStorage('cc_id');
	    }
							
      	callAjax("placeOrder","merchant_id="+ getStorage('merchant_id') + 
      	  "&cart="+ urlencode(cart_params) +      	  
      	  "&transaction_type=" + 
      	  getStorage("transaction_type") + extra_params );
      	  
	} else {
		onsenAlert( getTrans("Please select payment method",'please_select_payment_method') );
	}
}

function showMerchantInfo(data)
{
	dump(data);
	/* Atualização João Neves (Pede.ai) Cabeçalho App dentro do menu do estabelecimento */
	$("#page-merchantinfo .estabelecimento-header2").attr("style",'background-image: url(http://kabrob.com.br/upload/'+data.merchant_info.merchant_bg+'); background-size: 108%; padding-bottom: 42px; box-sizing: border-box; position: fixed; top: 0px; left: 0px; right: 0px;');
	$("#page-merchantinfo .estabelecimento-header").attr("style",'background-image: url(http://kabrob.com.br/upload/'+data.merchant_info.merchant_bg+'); background-size: cover; box-sizing: border-box; position: relative; top: -42px; left: 0px; right: 0px; height: 165px; z-index: -1;');
	/* Fim da Atualização */
	$("#page-merchantinfo h3").html(data.merchant_info.restaurant_name);
	$("#page-merchantinfo h5").html(data.merchant_info.cuisine);
	/* Atualização João Neves (Pede.ai) Cabeçalho App dentro do menu do estabelecimento */
	$("#page-merchantinfo address").html(data.merchant_info.address+ "<br><br>" + data.merchant_info.merchant_information);
	/* Fim da Atualização */
	$("#page-merchantinfo .rating-stars").attr("data-score",data.merchant_info.ratings.ratings);	
	if (!empty(data.reviews)){
	   $(".total-reviews").html(data.reviews.total_review + " "+ getTrans("reviews",'reviews') );
	}	
	$(".opening-hours").html(data.opening_hours);
	
	if (!empty(data.payment_method)){
		var p='';
		p+='<ons-list-header class="center trn" data-trn-key="payment_methods">Payment Methods</ons-list-header>';
		 $.each( $(data.payment_method) , function( key, val ) { 			
		   p+=tplPaymentListStatic(val.value , val.label, val.icon);
		});
		createElement('merchant-payment-list', p );
	}
	
	/*if (!empty(data.reviews)){
		$(".latest-review").html( data.reviews.date_created +" - " + data.reviews.client_name);
	}*/
	
	/*if (!empty(data.maps)){
		$("#merchant-map").show();	
			
		var locations={
		"name":data.merchant_info.restaurant_name,
		"lat":data.maps.merchant_latitude,
		"lng":data.maps.merchant_longtitude
		};		
		initMerchantMap(locations);			
				
	} else {
		$("#merchant-map").hide();
	}*/
	
	/*check if booking is enabled*/
	/*if ( data.enabled_table_booking==2){
		$("#book-table").show();
	} else $("#book-table").hide();*/
	
	
	$("#book-table").hide();
	
	initRating();	
}

function loadBookingForm()
{
	var options = {
      animation: 'slide',
      onTransitionEnd: function() { 	
      					      	 
      	  displayMerchantLogo2( 
      	     getStorage("merchant_logo") ,
      	     '' ,
      	     'page-booking'
      	  );      	  
      	  
      	  initMobileScroller();
      	  
      	  /*translate booking form*/
      	  $(".number_guest").attr("placeholder", getTrans('Number Of Guests','number_of_guest') );
      	  $(".date_booking").attr("placeholder", getTrans('Date Of Booking','date_of_booking') );
      	  $(".booking_time").attr("placeholder", getTrans('Time Of Booking','time_of_booking') );
      	  $(".booking_name").attr("placeholder", getTrans('Name','name') );
      	  $(".email").attr("placeholder", getTrans('Email Address','email_address') );
      	  $(".mobile").attr("placeholder", getTrans('Mobile Number','mobile_number') );
      	  $(".booking_notes").attr("placeholder", getTrans('Your Instructions','your_instructions') );
      	  
      	  translateValidationForm();
      	        	  
      } 
    };   
    sNavigator.pushPage("booking.html", options);		 
}

function submitBooking()
{
	$.validate({ 	
	    form : '#frm-booking',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	    
	    onSuccess : function() {     	      
	      var params = $( "#frm-booking").serialize();	      
	      params+="&merchant_id=" +  getStorage("merchant_id") ;
	      params+="&client_token="+ getStorage("client_token");
	      callAjax("bookTable",params);	       
	      return false;
	    }  
	});
}

function loadMoreReviews()
{
	var page = sNavigator.getCurrentPage();		
	if ( page.name=="reviews.html"){		
		var params="merchant_id=" +  getStorage("merchant_id") ;
	    callAjax("merchantReviews",params);	             	       
		return;
	}
	
	var options = {
      animation: 'slide',
      onTransitionEnd: function() { 						      	  
      	  displayMerchantLogo2( 
      	     getStorage("merchant_logo") ,
      	     '' ,
      	     'page-reviews'
      	  );       	  
      	  var params="merchant_id=" +  getStorage("merchant_id") ;
	      callAjax("merchantReviews",params);	             	       
      } 
    };   
    sNavigator.pushPage("reviews.html", options);		 	
}

function displayReviews(data)
{
	var htm='';
	$.each( data, function( key, val ) {        		  
		htm+=tplReviews(val.rating, val.client_name, val.review, val.date_created );
	});	
	createElement('review-list-scroller',htm);
	initRating();
}

function showReviewForm()
{
	var options = {
      animation: 'none',
      onTransitionEnd: function() { 						      	  
      	  displayMerchantLogo2( 
      	     getStorage("merchant_logo") ,
      	     '' ,
      	     'page-addreviews'
      	  );          	  
      	  
      	  translatePage();
      	  $(".rating").attr("placeholder", getTrans('Your Rating 1 to 5','your_rating') );
          $(".review").attr("placeholder", getTrans('Your reviews','your_reviews') );     
          translateValidationForm();      
          
          $('.raty-stars').raty({ 
			   score:0,
			   readOnly: false, 		
			   path: 'lib/raty/images',
			   click: function (score, evt) {					   	   
			   	   $(".rating").val( score );
			   }
		  });              
          	  
      }                   
    };   
    sNavigator.pushPage("addReviews.html", options);		 	
}

function addReview()
{
	$.validate({ 	
	    form : '#frm-addreview',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	    
	    onSuccess : function() {     	      
	      var params = $( "#frm-addreview").serialize();	      
	      params+="&merchant_id=" +  getStorage("merchant_id") ;
	      params+="&client_token="+ getStorage("client_token");
	      callAjax("addReview",params);	       
	      return false;
	    }  
	});
}



function showFilterResto()
{	
	if (typeof dialogBrowseResto === "undefined" || dialogBrowseResto==null || dialogBrowseResto=="" ) { 	    
		ons.createDialog('filterBrowseResto.html').then(function(dialog) {
			$(".restaurant_name").val('');
	        dialog.show();
	        
	        translatePage();
	        translateValidationForm();
	        $(".restaurant_name").attr("placeholder", getTrans('Enter Restaurant name','enter_resto_name')  );
	        
	    });	
	} else {
		$(".restaurant_name").val('');
		dialogBrowseResto.show();
		
		/*translatePage();
	    translateValidationForm();
	    $(".restaurant_name").attr("placeholder", getTrans('Enter Restaurant name','enter_resto_name')  );*/
	}		
}

function submitFilterBrowse()
{
	$.validate({ 	
	    form : '#frm-filterbrowse',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	    
	    onSuccess : function() {     	      
	      dialogBrowseResto.hide();	
	      var params = $( "#frm-filterbrowse").serialize();	      	      
	      callAjax("browseRestaurant",params);	       
	      return false;
	    }  
	});
}

function showProfile()
{
	if (isLogin()){
		menu.setMainPage('profile.html', {closeMenu: true});
	} else {
		menu.setMainPage('prelogin.html', {closeMenu: true})
	}
}

function saveProfile()
{
	$.validate({ 	
	    form : '#frm-profile',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	    
	    onSuccess : function() {     	   	      
	      var params = $( "#frm-profile").serialize();	      	      
	      params+="&client_token="+ getStorage("client_token");
	      callAjax("saveProfile",params);	       
	      return false;
	    }  
	});	
}

function login()
{
	$.validate({ 	
	    form : '#frm-login',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	   
	    onSuccess : function() {     	   	      
	      var params = $( "#frm-login").serialize();
	      params+="&device_id="+ getStorage("device_id");
	      if (isDebug()){
	      	  params+="&device_platform=Android";
	      } else {
	      	  params+="&device_platform="+ device.platform;
	      }	      
	      callAjax("login",params);	       
	      return false;
	    }  
	});	
}

function logout()
{
	removeStorage("client_token");
	onsenAlert(  getTrans("Your are now logout",'you_are_now_logout') );
	menu.setMainPage('home.html', {closeMenu: true});	
}

function isLogin()
{
	if (!empty(getStorage("client_token"))){
		return true;
	}
	return false;
}

function showLogin(next_steps)
{
   var options = {
      animation: 'slide',
      onTransitionEnd: function() {       	  
      	  if ( !empty(next_steps)){
      	  	 $(".page-login-fb").show();
    	     $(".next_steps").val( getStorage("transaction_type") );
          } else {
          	 $(".page-login-fb").hide();
          	 $(".next_steps").val( '' );
          }
      } 
    };       
    sNavigator.pushPage("login.html", options);		 	
}

function showForgotPass()
{
	$(".email_address").val('');
	if (typeof dialogForgotPass === "undefined" || dialogForgotPass==null || dialogForgotPass=="" ) { 	    
		ons.createDialog('forgotPassword.html').then(function(dialog) {
	        dialog.show();
	        translatePage();
	        translateValidationForm();	        
	        $(".email_address").attr("placeholder",  getTrans('Email Address','email_address') );
	    });	
	} else {
		dialogForgotPass.show();		
	}	
}

function forgotPassword()
{
	$.validate({ 	
	    form : '#frm-forgotpass',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	    
	    onSuccess : function() {     	   	      
	      var params = $( "#frm-forgotpass").serialize();	      	      	      
	      callAjax("forgotPassword",params);	       
	      return false;
	    }  
	});	
}

function showSignupForm()
{
	var options = {
      animation: 'slide',
      onTransitionEnd: function() {          	  
      	  callAjax("getCustomFields",'');   
      	  initIntelInputs();	  
      } 
    };   
    sNavigator.pushPage("signup.html", options);		 	
}

function signup()
{	
	$.validate({ 	
	    form : '#frm-signup',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	    
	    onSuccess : function() {     

	      if ($('.iagree-wrap').is(':visible')) {	
		      var iagree = $(".iagree:checked").val();	
		      if(empty(iagree)){
		      	 onsenAlert( getTrans("You must agree to terms & conditions",'agree_terms') );
		      	 return;
		      }
	      }
	     	    
	      var params = $( "#frm-signup").serialize();	      
	      params+="&device_id="+ getStorage("device_id");
	      
	      if (isDebug()){
	      	  params+="&device_platform=Android";
	      } else {
	      	  params+="&device_platform="+ device.platform;
	      }	      
	      
	      callAjax("signup",params);	       
	      return false;
	    }  
	});
}

function Dicas()
{
 setHome();
}

function showOrders()
{
	if (isLogin()){		
		menu.setMainPage('orders.html', {closeMenu: true});
	} else {
		menu.setMainPage('prelogin.html', {closeMenu: true});
	}
}

function showAddressBook()
{
  if (isLogin()){
		menu.setMainPage('addressBook.html', {closeMenu: true});
	} else {
		menu.setMainPage('prelogin.html', {closeMenu: true});
	}
}

function displayOrderHistory(data)
{
	var htm='<ons-list>';
	$.each( data, function( key, val ) {   
	     //htm+='<ons-list-item modifier="tappable" class="list-item-container" onclick="showOrderDetails('+val.order_id+');" >';
	     htm+='<ons-list-item modifier="tappable" class="list-item-container" onclick="showOrderOptions('+val.order_id+');" >';
           htm+='<ons-row class="row">';
              htm+='<ons-col class="col-orders concat-text">';
                htm+=val.title;
              htm+='</ons-col>';
              htm+='<ons-col class="col-order-stats center" width="98px">';
                 htm+='<span class="notification concat-text '+val.status_raw+' ">'+val.status+'</span>';
              htm+='</ons-col>';
           htm+='</ons-row>';
         htm+='</ons-list-item>';
	});
	htm+='</ons-list>';
	createElement('recent-orders',htm);	
}

function showOrderDetails(order_id)
{
    dump(order_id);
	var options = {
      animation: 'slide',
      onTransitionEnd: function() {        	
      	var params="client_token="+ getStorage("client_token")+"&order_id="+order_id;
      	callAjax("ordersDetails",params);
      } 
    };
    sNavigator.pushPage("ordersDetails.html", options);	
}

function displayOrderHistoryDetails(data)
{
	//$("#page-orderdetails .title").html("Total : "+ data.total);
	//$("#page-orderdetails #search-text").html("Order Details #"+data.order_id);
	$("#page-orderdetails .title").html( getTrans('Total','total') + " : "+ data.total);
	$("#page-orderdetails #search-text").html( getTrans('Order Details','order_details') + " #"+data.order_id);
	
	
	var htm='<ons-list-header class="center trn" data-trn-key="items" >Items</ons-list-header>';
	if ( data.item.length>0){
		$.each( data.item, function( key, val ) {   			  
			  htm+='<ons-list-item class="center">'+val.item_name+'</ons-list-item> ';
		});	
	} else {
		htm+='<ons-list-item class="center">';
		htm+='no item found';
		htm+='</ons-list-item>';
	}
	createElement('item-details', htm );
	
	var htm='<ons-list-header class="center trn" data-trn-key="status_history">Status History</ons-list-header>';	
	if ( data.history_data.length>0){		
		$.each( data.history_data, function( key, val ) {   		
			dump(val);
			htm+='<ons-list-item>';
	        htm+='<ons-row class="row">';
	           htm+='<ons-col class="" width="40%">';
	             htm+= val.date_created;
	           htm+='</ons-col>';
	           htm+='<ons-col class="padding-left5" width="30%">';
	             htm+=val.status;
	           htm+='</ons-col>';
	           htm+='<ons-col class="padding-left5"  width="25%">';
	             htm+=val.remarks;
	           htm+='</ons-col>';
	        htm+='</ons-row>';
	       htm+='</ons-list-item>';
		});		
	} else {
		htm+='<ons-list-item class="center">';
		htm+='No history found';
		htm+='</ons-list-item>';
	}
	createElement('item-history', htm );
		
	if ( data.order_from.request_from=="mobile_app"){
	var html='<button class="button green-btn button--large trn" onclick="reOrder('+data.order_id+');" data-trn-key="click_here_to_reorder" >';
	html+='Click here to Re-order';
	html+='<div class="search-btn"><ons-icon icon="ion-forward"></ons-icon></div>';
    html+='</button>';
    createElement('re-order-wrap', html );
	}
         
   translatePage();
}

function reOrder(order_id)
{
	var params="client_token="+ getStorage("client_token")+"&order_id="+order_id;
     callAjax("reOrder",params);
}

function displayAddressBook(data)
{
	var htm='<ons-list>';
	if ( data.length>0){		
	   $.each( data, function( key, val ) {   		
	     htm+='<ons-list-item modifier="tappable" onclick="modifyAddressBook('+val.id+');" >';
	         htm+='<ons-row class="row">';
	            htm+='<ons-col class="" width="70%">';
	            htm+='<p class="small-font-dim">'+val.address+'</p>';
	            htm+='</ons-col>';
	            htm+='<ons-col class="text-right" >';
	              if (val.as_default==2){
	                 htm+='<ons-icon icon="ion-ios-location-outline"></ons-icon>';
	              }
	            htm+='</ons-col>';
	         htm+='<ons-row>';
	     htm+='</ons-list-item>';
	   });
   }  
   htm+='</ons-list>';
   
   createElement('address-book-list', htm );
}

function modifyAddressBook(id)
{
	dump(id);	
	var options = {
      animation: 'slide',
      onTransitionEnd: function() {        	
      	var params="client_token="+ getStorage("client_token")+"&id="+id;
      	callAjax("getAddressBookDetails",params);
      } 
    };
    sNavigator.pushPage("addressBookDetails.html", options);	
}

    // Adicionando Busca por CEP
    
    function limpa_formulario_cep() {
            //Limpa valores do formulário de cep.
            document.getElementById('rua').value=("");
            document.getElementById('bairro').value=("");
            document.getElementById('cidade').value=("");
            document.getElementById('uf').value=("");
            //document.getElementById('ibge').value=("");
    }

    function meu_callback(conteudo) {
        if (!("erro" in conteudo)) {
            //Atualiza os campos com os valores.
            document.getElementById('rua').value=(conteudo.logradouro);
            document.getElementById('bairro').value=(conteudo.bairro);
            document.getElementById('cidade').value=(conteudo.localidade);
            document.getElementById('uf').value=(conteudo.uf);
        } //end if.
        else {
            //CEP não Encontrado.
            limpa_formulario_cep();
            alert("CEP não encontrado.");
        }
    }
        
    function pesquisacep(valor) {

        //Nova variável "cep" somente com dígitos.
        var cep = valor.replace(/\D/g, '');

        //Verifica se campo cep possui valor informado.
        if (cep != "") {

            //Expressão regular para validar o CEP.
            var validacep = /^[0-9]{8}$/;

            //Valida o formato do CEP.
            if(validacep.test(cep)) {

                //Preenche os campos com "..." enquanto consulta webservice.
                document.getElementById('rua').value="...";
                document.getElementById('bairro').value="...";
                document.getElementById('cidade').value="...";
                document.getElementById('uf').value="...";
                //document.getElementById('ibge').value="...";

                //Cria um elemento javascript.
                var script = document.createElement('script');

                //Sincroniza com o callback.
                script.src = 'http://viacep.com.br/ws/'+ cep + '/json/?callback=meu_callback';

                //Insere script no documento e carrega o conteúdo.
                document.body.appendChild(script);

            } //end if.
            else {
                //cep é inválido.
                limpa_formulario_cep();
                alert("Formato de CEP inválido.");
            }
        } //end if.
        else {
            //cep sem valor, limpa formulário.
            limpa_formulario_cep();
        }
    };

function fillAddressBook(data)
{
	$(".action").val('edit');
	$(".delete-addressbook").show();
	
	$(".id").val( data.id );
	$(".street").val( data.street );
	$(".city").val( data.city );
	$(".state").val( data.state );
	$(".zipcode").val( data.zipcode );
	$(".location_name").val( data.location_name );	
	$(".country_code").val( data.country_code );		
	if (data.as_default==2){
		$(".as_default").attr("checked","checked");
	} else $(".as_default").removeAttr("checked");
}

function saveAddressBook()
{
	$.validate({ 	
	    form : '#frm-addressbook',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	    
	    onSuccess : function() {     	      
	      var params = $( "#frm-addressbook").serialize();	    
	      params+="&client_token="+ getStorage("client_token");
	      callAjax("saveAddressBook",params);	       
	      return false;
	    }  
	});
}

function newAddressBook()
{
	$(".delete-addressbook").hide();
	var options = {
      animation: 'slide',
      onTransitionEnd: function() {        	
      	$(".id").val('');
      	$(".action").val('add');
      } 
    };
    sNavigator.pushPage("addressBookDetails.html", options);
}

function deleteAddressBook()
{
	ons.notification.confirm({
	  message: getTrans('Delete this records?','delete_this_records') ,	  
	  title: dialog_title_default,
	  buttonLabels: ['Yes', 'No'],
	  animation: 'default', // or 'none'
	  primaryButtonIndex: 1,
	  cancelable: true,
	  callback: function(index) {
	  	dump(index);
	    if ( index==0){
	    	var id=$(".id").val();		
	        var params="&client_token="+ getStorage("client_token")+"&id="+id;
	        callAjax("deleteAddressBook",params);	       
	    }
	  }
	});	
}


function popUpAddressBook()
{	
	$(".manual-address-input").hide();
	
	if (typeof dialogAddressBook === "undefined" || dialogAddressBook==null || dialogAddressBook=="" ) { 	    
		ons.createDialog('dialogAddressBook.html').then(function(dialog) {			
	        dialog.show();
	        translatePage();
	    });	
	} else {		
		dialogAddressBook.show();
		//translatePage();
	}	
}

function displayAddressBookPopup(data)
{		
	var htm='<ons-list>';
	if ( data.length>0){		
	   $.each( data, function( key, val ) {   		
	   	 var complete_address=val.street+"|";
	   	 complete_address+=val.city+"|";
	   	 complete_address+=val.state+"|";
	   	 complete_address+=val.zipcode+"|";
	   	 complete_address+=val.location_name+"|";
	   	 complete_address+=val.contact_phone+"|";
	   	 
	     htm+='<ons-list-item modifier="tappable" class="setAddress" data-address="'+complete_address+'" >';
	         htm+='<ons-row class="row">';
	            htm+='<ons-col class="" width="80%">';
	            htm+='<p class="small-font-dim">'+val.address+'</p>';
	            htm+='</ons-col>';
	            htm+='<ons-col class="text-right" >';
	              if (val.as_default==2){
	                 htm+='<ons-icon icon="ion-ios-location-outline"></ons-icon>';
	              }
	            htm+='</ons-col>';
	         htm+='<ons-row>';
	     htm+='</ons-list-item>';
	   });
   }  
   htm+='</ons-list>';
   
   createElement('addressbook-popup', htm );
}

function initFacebook()
{	
   dump('initFacebook');  
   if ( !empty(krms_config.facebookAppId)){   	   
   	   var facebook_flag = getStorage("facebook_flag");
   	   if (facebook_flag==2){
	   	   $(".fb-loginbutton").show();
	       openFB.init({appId: krms_config.facebookAppId });       
   	   } else {
   	   	   $(".fb-loginbutton").hide();
   	   }
   } else {   	   
   	   $(".fb-loginbutton").hide();
   }
   
   /*$.ajaxSetup({ cache: true });
    $.getScript('//connect.facebook.net/en_US/sdk.js', function(){
    FB.init({
      appId: '191654534503876',
      version: 'v2.3' // or v2.0, v2.1, v2.2, v2.3
    });         
  });*/
}

function myFacebookLogin()
{		
	/*FB.getLoginStatus(function(response) {
		if (response.status === 'connected') {
			 dump('already login');
		 	 getFbInfo();
		} else {			
			FB.login(function(response){
			 	dump(response);
			 	if ( response.status=="connected"){	 	
			 	  getFbInfo();
			 	} else {
			 		onsenAlert("Login failed.");
			 	}
			 }, {scope: 'public_profile,email'});			
		}
	});	*/	
	openFB.login(
    function(response) {
        if(response.status === 'connected') {        	
            //alert('Facebook login succeeded, got access token: ' + response.authResponse.token);             
            getFbInfo();
        } else {
            alert('Facebook login failed: ' + response.error);
        }
    }, {scope: 'public_profile,email'});
}

function getFbInfo()
{			
	openFB.api({
		path: '/me',
		params: {
			fields:"email,first_name,last_name"
		},
		success: function(data) {			
		    dump(data);				    
		    var params="&email="+ data.email;
	        params+="&first_name="+data.first_name;
	        params+="&last_name="+data.last_name;
	        params+="&fbid="+data.id;
	        params+="&device_id="+ getStorage("device_id");
	        
	        if (isDebug()){
	      	  params+="&device_platform=Android";
	        } else {
	      	  params+="&device_platform="+ device.platform;
	        }	     
	        
	        if ( $(".next_steps").exists()){
	           params+="&next_steps="+ $(".next_steps").val();        
	        }	        
		    callAjax("registerUsingFb",params);	       
		    
    },
    error: fbErrorHandler});
    
	/*FB.api('/me?fields=email,name', function(response) {
        dump(response);
        var params="&email="+ response.email;
        params+="&name="+response.name;
        params+="&fbid="+response.id;
        
        if ( $(".next_steps").exists()){
           params+="&next_steps="+ $(".next_steps").val();        
        }
	    callAjax("registerUsingFb",params);	       
    });*/
}

function fbErrorHandler(error) {
    alert("ERROR=> "+error.message);
}


function FBlogout()
{
	/*FB.logout(function(response) {   
       dump(response);
   });*/
	openFB.logout(
	function() {
	   onsenAlert( 'Logout successful' );
	},
	fbErrorHandler);
}

function paypalSuccessfullPayment(response)
{	
	var params="response="+response;
	params+="&order_id="+ getStorage("order_id");
	params+="&client_token="+ getStorage("client_token");	
	callAjax("paypalSuccessfullPayment",params);	
}

function showNotification(title,message)
{	
			
	if (typeof pushDialog === "undefined" || pushDialog==null || pushDialog=="" ) { 	    
		ons.createDialog('pushNotification.html').then(function(dialog) {
			$(".push-title").html(title);
	        $(".push-message").html(message);
	        dialog.show();
	    });	
	} else {
		$(".push-title").html(title);
	    $(".push-message").html(message);
		pushDialog.show();
	}	
}

function showOrders2()
{	
	pushDialog.hide();
	if (isLogin()){
		menu.setMainPage('orders.html', {closeMenu: true});		
	} else {
		menu.setMainPage('prelogin.html', {closeMenu: true});
	}
}

function initMerchantMap(data)
{		
	dump(data);	
	if ( !empty(data)){
		var map = new GoogleMap();	
	    map.initialize('merchant-map', data.lat, data.lng , 15);
	} else {
		$("#merchant-map").hide();
	}
}

function getCurrentLocation()
{
	/*alert( device.platform );	
	alert( device.version );*/
	
	if ( device.platform=="Android"){
		if ( device.version >= 6){
			//alert('andoroid 6x');			
		}
	}
	
	if (isDebug()){
		onRequestSuccess();
		return;
	}
	
	if ( device.platform=="iOS"){		
		getCurrentLocationOld();
	} else {
		
		var can_request=true;
		cordova.plugins.locationAccuracy.canRequest(function(canRequest){
		 	 if(!canRequest){	
		 	 	can_request=false;
		 	 	var _message=getTrans('Your device has no access to location Would you like to switch to the Location Settings page and do this manually?','location_off')
			   	   ons.notification.confirm({
					  message: _message,		  
					  title: dialog_title_default ,
					  buttonLabels: ['Yes', 'No'],
					  animation: 'none',
					  primaryButtonIndex: 1,
					  cancelable: true,
					  callback: function(index) {
					     if ( index==0 || index=="0"){
					     	cordova.plugins.diagnostic.switchToLocationSettings();
					     } 
					  }
				 });			   			 
		 	 }
		});
		
		if(!can_request){
			return;
		}
		
	   cordova.plugins.locationAccuracy.request(
	    onRequestSuccess, onRequestFailure, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
	}
}

function onRequestSuccess()
{	
	loader.show();
	//  {enableHighAccuracy:false,maximumAge:Infinity, timeout:60000}
	navigator.geolocation.getCurrentPosition(geolocationSuccess,geolocationError, 
	 { timeout: 10000 , enableHighAccuracy: getLocationAccuracy() } );	
	 
	/*navigator.geolocation.getCurrentPosition(geolocationSuccess,geolocationError, 
	 { timeout:10000 , enableHighAccuracy: false } );	*/
	 	
}

function onRequestFailure(error){    
	//alert("Accuracy request failed: error code="+error.code+"; error message="+error.message);    
    if(error.code == 4){
    	toastMsg( getTrans("You have choosen not to turn on location accuracy",'turn_off_location') );
    	getCurrentLocation();
    } else {
    	toastMsg( error.message );
    }
}

function getCurrentLocationOld()
{	
   CheckGPS.check(function win(){
    //GPS is enabled! 
    loader.show();
    navigator.geolocation.getCurrentPosition(geolocationSuccess,geolocationError, 
    { timeout:10000 , enableHighAccuracy: getLocationAccuracy() } );             
   },
   function fail(){
      //GPS is disabled!
      var m_1= getTrans('Your GPS is disabled, this app needs to be enabled to work.','your_gps');
      var m_2= getTrans('Use GPS for location.','use_gps_for_location');
      var m_3= getTrans('Improve location accuracy','improve_location_accuracy');
      var b_1= getTrans('Cancel','cancel');
      var b_2= getTrans('Later','later');
      var b_3= getTrans('Go','go');
      
      cordova.dialogGPS( m_1 ,//message
	    m_2,//description
	    function(buttonIndex){//callback
	      switch(buttonIndex) {
	        case 0: break;//cancel
	        case 1: break;//neutro option
	        case 2: break;//user go to configuration
	      }
	    },
	      m_3+"?",//title
	      [b_1, b_2, b_3]
	    );//buttons
   });	    
}


function geolocationSuccess(position)
{
	dump(position);
	var params="lat="+position.coords.latitude;
	params+="&lng="+position.coords.longitude;
	callAjax("reverseGeoCoding",params);
}

function geolocationError(error)
{
	hideAllModal();
	/*onsenAlert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');*/
	toastMsg( error.message );
}

function saveSettings()
{	
	setStorage("country_code_set", $(".country_code_set").val() );
	
	var params = $( "#frm-settings").serialize();	 
	params+="&client_token="+getStorage("client_token");	
	params+="&device_id="+getStorage("device_id");	
	callAjax("saveSettings",params);	    
}

function showLocationPopUp()
{
	if (typeof locationDialog === "undefined" || locationDialog==null || locationDialog=="" ) { 	    
		ons.createDialog('locationOptions.html').then(function(dialog) {
	        dialog.show();
	        translatePage();
	    });	
	} else {
		locationDialog.show();
		//translatePage();
	}	
}

function displayLocations(data)
{
	var htm='';
	htm+='<ons-list>';
	htm+='<ons-list-header class="list-header trn" data-trn-key="country">Country</ons-list-header>';
	$.each( data.list, function( key, val ) {        		  		  
		ischecked='';
		if ( key==data.selected){
			ischecked='checked="checked"';
		}
		htm+='<ons-list-item modifier="tappable" onclick="setCountry('+"'"+key+"'"+');">';
		 htm+='<label class="radio-button checkbox--list-item">';
			htm+='<input type="radio" name="country_code" class="country_code" value="'+key+'" '+ischecked+' >';
			htm+='<div class="radio-button__checkmark checkbox--list-item__checkmark"></div>';
			htm+=' '+val;
		  htm+='</label>'; 
		htm+='</ons-list-item>';
	});		
	htm+='</ons-list>';	
	createElement('location-options-list',htm);	
	translatePage();
}

function setCountry(country_code)
{		
	$(".country_code_set").val(country_code);	
	setStorage("country_code_set",country_code);
}

function addressPopup()
{
	if (typeof addressDialog === "undefined" || addressDialog==null || addressDialog=="" ) { 	    
		ons.createDialog('addressPopup.html').then(function(dialog) {
	        dialog.show({"callback":geoCompleteChangeAddress});
	        translatePage();
	        translateValidationForm();	        
	        $(".new_s").attr("placeholder",  getTrans('Enter your address','enter_your_address') );
	    });	
	} else {
		addressDialog.show( {"callback":geoCompleteChangeAddress} );
	}	
		
}

function changeAddress()
{	
	$.validate({ 	
	    form : '#frm-adddresspopup',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	    
	    onSuccess : function() {     	      
	        dump('change address');
	        
	        sNavigator.popPage({cancelIfRunning: true}); //back button
	        
	        setStorage("search_address", $(".new_s").val() );
			var cart_params=JSON.stringify(cart);       	  
			if (saveCartToDb()){
			    cart_params='';
			}
		    callAjax("loadCart","merchant_id="+ getStorage('merchant_id')+"&search_address=" + 
		    encodeURIComponent($(".new_s").val()) + "&cart="+cart_params +"&transaction_type=" +
		    getStorage("transaction_type") + "&device_id="+ getStorage("device_id") );
	        return false;
	    }  
	});		
}

function geoCompleteChangeAddress()
{
	dump( "country_code_set=>" + getStorage("country_code_set"));
	if ( empty(getStorage("country_code_set")) ){		
		$("#new_s").geocomplete();		
	} else {		
		$("#new_s").geocomplete({
		   country: getStorage("country_code_set")
	    });	
	}
	$(".pac-container").css( {"z-index":99999} );
}

/* function showNotificationCampaign(title,message)
{	
			
	if (typeof pushcampaignDialog === "undefined" || pushcampaignDialog==null || pushcampaignDialog=="" ) { 	    
		ons.createDialog('pushNotificationCampaign.html').then(function(dialog) {
			$("#page-notificationcampaign .push-title").html(title);
	        $("#page-notificationcampaign .push-message").html(message);
	        dialog.show();
	    });	
	} else {
		$("#page-notificationcampaign .push-title").html(title);
	    $("#page-notificationcampaign .push-message").html(message);
		pushcampaignDialog.show();
	}	
}*/

function itemNotAvailable(options)
{
	switch (options)
	{
		case 1:
		toastMsg( getTrans("item not available",'item_not_available') );
		break;
		
		case 2:
		toastMsg( getTrans("Ordering is disabled",'ordering_disabled') );
		return;
		
		break;
	}	
}

function number_format(number, decimals, dec_point, thousands_sep) 
{
  number = (number + '')
    .replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + (Math.round(n * k) / k)
        .toFixed(prec);
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
    .split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '')
    .length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1)
      .join('0');
  }
  return s.join(dec);
}

var translator;
var dictionary;

function getLanguageSettings()
{
	if ( !hasConnection() ){
		return;
	}	
	var params="&client_token="+getStorage("client_token");
	callAjax("getLanguageSettings",params);		
}

function translatePage()
{
	dump("TranslatePage");			
	//if (getStorage("translation")!="undefined"){
	if (typeof getStorage("translation") === "undefined" || getStorage("translation")==null || getStorage("translation")=="" ) { 	   
		return;		
	} else {
		dictionary =  JSON.parse( getStorage("translation") );
	}
	if (!empty(dictionary)){
		//dump(dictionary);		
		var default_lang=getStorage("default_lang");
		//dump(default_lang);
		if (default_lang!="undefined" && default_lang!=""){
			dump("INIT TRANSLATE");
			translator = $('body').translate({lang: default_lang, t: dictionary});
		} 
	}		
}

function getTrans(words,words_key)
{
	var temp_dictionary='';
	/*dump(words);
	dump(words_key);	*/
	if (getStorage("translation")!="undefined"){
	   temp_dictionary =  JSON.parse( getStorage("translation") );
	}
	if (!empty(temp_dictionary)){
		//dump(temp_dictionary);		
		var default_lang=getStorage("default_lang");
		//dump(default_lang);
		if (default_lang!="undefined" && default_lang!=""){
			//dump("OK");
			if ( array_key_exists(words_key,temp_dictionary) ){
				//dump('found=>' + words_key +"=>"+ temp_dictionary[words_key][default_lang]);				
				return temp_dictionary[words_key][default_lang];
			}
		}
	}	
	return words;
}

function array_key_exists(key, search) {  
  if (!search || (search.constructor !== Array && search.constructor !== Object)) {
    return false;
  }
  return key in search;
}

function translateValidationForm()
{
	$.each( $(".has_validation") , function() { 
		var validation_type = $(this).data("validation");
		
		switch (validation_type)
		{
			case "number":			
			$(this).attr("data-validation-error-msg",getTrans("The input value was not a correct number",'validation_numeric') );
			break;
			
			case "required":
			$(this).attr("data-validation-error-msg",getTrans("this field is mandatory!",'validaton_mandatory') );
			break;
			
			case "email":
			$(this).attr("data-validation-error-msg",getTrans("You have not given a correct e-mail address!",'validation_email') );
			break;
		}
		
	});
}

function showLanguageList()
{
	if (typeof languageOptions === "undefined" || languageOptions==null || languageOptions=="" ) { 	    
		ons.createDialog('languageOptions.html').then(function(dialog) {
	        dialog.show();
	        translatePage();
	    });	
	} else {
		languageOptions.show();		
	}	
}

function displayLanguageSelection(data)
{
	var selected = getStorage("default_lang");
	dump("selected=>"+selected);	
	var htm='';
	htm+='<ons-list>';
	htm+='<ons-list-header class="list-header trn" data-trn-key="language">Language</ons-list-header>';
	$.each( data, function( key, val ) {        		  		  
		dump(val.lang_id);
		ischecked='';
		if ( key==selected){
			ischecked='checked="checked"';
		}
		htm+='<ons-list-item modifier="tappable" onclick="setLanguage('+"'"+key+"'"+');">';
		 htm+='<label class="radio-button checkbox--list-item">';
			htm+='<input type="radio" name="country_code" class="country_code" value="'+key+'" '+ischecked+' >';
			htm+='<div class="radio-button__checkmark checkbox--list-item__checkmark"></div>';
			htm+=' '+val;
		  htm+='</label>'; 
		htm+='</ons-list-item>';
	});		
	htm+='</ons-list>';	
	createElement('language-options-list',htm);	
	translatePage();
}

function setLanguage(lang_id)
{	
	//removeStorage("translation");
	dump( getStorage("translation") );
	if (typeof getStorage("translation") === "undefined" || getStorage("translation")==null || getStorage("translation")=="" ) { 	
	   languageOptions.hide();   
       ons.notification.confirm({
		  message: 'Language file has not been loaded, would you like to reload?',		  
		  title: dialog_title_default ,
		  buttonLabels: ['Yes', 'No'],
		  animation: 'none',
		  primaryButtonIndex: 1,
		  cancelable: true,
		  callback: function(index) {
		     if ( index==0 || index=="0"){
		     	getLanguageSettings();		     	
		     } 
		  }
		});
		return;
	}	
		
	if ( getStorage("translation").length<=5 ){	
		onsenAlert("Translation file is not yet ready.");	
		return;
	}
	
	if ( !empty(lang_id) ){	   
	   setStorage("default_lang",lang_id);
	   if ( !empty(translator)){
	       translator.lang(lang_id);
	   } else {
	   	   translator = $('body').translate({lang: lang_id, t: dictionary});
	   }	   
	}
}

function applyVoucher()
{
	
	if ( checkIfhasOfferDiscount() ){
		return false;
	}
	
	voucher_code = $(".voucher_code").val();
	if ( voucher_code!="" ){
		var params="voucher_code="+ voucher_code;        
		params+="&client_token="+getStorage("client_token");
		params+="&merchant_id="+ getStorage("merchant_id");
		
		params+="&cart_sub_total="+ getStorage("cart_sub_total");
		transaction_type=getStorage("transaction_type");        
        	params+="&transaction_type=" + getStorage("transaction_type");
		params+="&cart_delivery_charges="+ getStorage("cart_delivery_charges");
		params+="&cart_packaging="+ getStorage("cart_packaging");
		params+="&cart_tax="+ getStorage("cart_tax");
		params+="&pts_redeem_amount="+ $(".pts_redeem_amount").val();
		
		if ( empty(getStorage("tips_percentage")) ){
	       setStorage("tips_percentage",0);
	    }
	    params+="&tips_percentage=" + getStorage("tips_percentage");
		
        callAjax("applyVoucher",params);	 
	} else {
		onsenAlert(  getTrans('invalid voucher code','invalid_voucher_code') );
	}
}

function removeVoucher()
{
	$(".voucher_amount").val( '' );
    $(".voucher_type").val( '' );
    $(".voucher_code").val('');
   
    $(".apply-voucher").show();
    $(".remove-voucher").hide();
    
    $(".voucher-header").html( getTrans("Voucher",'voucher') );
    
    $(".total-amount").html( prettyPrice(getStorage("order_total_raw")) );
}

function deviceBackReceipt()
{
	return false;
}

function prettyPrice( price )
{
	dump(price);
	
	var decimal_place = getStorage("decimal_place");		
	var currency_position= getStorage("currency_position");
	var currency_symbol = getStorage("currency_set");
	var thousand_separator = getStorage("thousand_separator");
	var decimal_separator = getStorage("decimal_separator");	
			
	dump("decimal_place=>"+decimal_place);	
	dump("currency_symbol=>"+currency_symbol);
	dump("thousand_separator=>"+thousand_separator);
	dump("decimal_separator=>"+decimal_separator);
	dump("currency_position=>"+currency_position);
		
	price = number_format(price,decimal_place, decimal_separator ,  thousand_separator ) ;
	
	if ( currency_position =="left"){
		return currency_symbol+""+price;
	} else {
		return price+""+currency_symbol;
	}
}

function showExpirationMonth()
{
	if (typeof ExpirationMonthDialog === "undefined" || ExpirationMonthDialog==null || ExpirationMonthDialog=="" ) { 	    
		ons.createDialog('ExpirationMonth.html').then(function(dialog) {
	        dialog.show();
	        translatePage();
	    });	
	} else {
		ExpirationMonthDialog.show();
		//translatePage();
	}	
}

function fillExpirationMonth()
{
	var htm='';
	htm+='<ons-list id="card_expiration">';
	htm+='<ons-list-header class="list-header trn" data-trn-key="expiration_month">Expiration Month</ons-list-header>';
	for (i = 1; i < 13; i++) { 
		if (i<=9){
			i="0"+i;
		}
		htm+='<ons-list-item modifier="tappable" onclick="setExpirationMonth('+"'"+i+"'"+');">';
		 htm+='<label class="radio-button checkbox--list-item">';
			htm+='<input type="radio" name="expiration_m" class="expiration_m" value="'+i+'"  >';
			htm+='<div class="radio-button__checkmark checkbox--list-item__checkmark"></div>';
			htm+=' '+i;
		  htm+='</label>'; 
		htm+='</ons-list-item>';
	}
	htm+='</ons-list>';	
	createElement('expiration-options-list',htm);	
	translatePage();
}

function setExpirationMonth(month)
{	
	$(".expiration_month").val( month );
	$(".expiration_month_label").html( month );
	ExpirationMonthDialog.hide();
}

function showExpirationYear()
{
	if (typeof showExpirationYearDialog === "undefined" || showExpirationYearDialog==null || showExpirationYearDialog=="" ) { 	    
		ons.createDialog('showExpirationYearDialog.html').then(function(dialog) {
	        dialog.show();
	        translatePage();
	    });	
	} else {
		showExpirationYearDialog.show();
	}	
}

function fillExpirationYear()
{
	var d = new Date();
    var current_year = d.getFullYear(); 
    
	var htm='';
	htm+='<ons-list id="card_expiration">';
	htm+='<ons-list-header class="list-header trn" data-trn-key="expiration_year">Expiration Year</ons-list-header>';
	for (i = 0; i < 15; i++) { 
		
		years = parseInt(current_year)+i;
		
		htm+='<ons-list-item modifier="tappable" onclick="setExpirationYear('+"'"+years+"'"+');">';
		 htm+='<label class="radio-button checkbox--list-item">';
			htm+='<input type="radio" name="expiration_m" class="expiration_m" value="'+years+'"  >';
			htm+='<div class="radio-button__checkmark checkbox--list-item__checkmark"></div>';
			htm+=' '+years;
		  htm+='</label>'; 
		htm+='</ons-list-item>';
	}
	htm+='</ons-list>';	
	createElement('expiration-year-options-list',htm);	
	translatePage();
}

function setExpirationYear(year_value)
{
	dump(year_value);
	$(".expiration_yr").val( year_value );	
	$(".expiration_year").html( year_value );
	showExpirationYearDialog.hide();
}

function showCountry()
{
	if (typeof showCountryDialog === "undefined" || showCountryDialog==null || showCountryDialog=="" ) { 	    
		ons.createDialog('showCountryDialog.html').then(function(dialog) {
	        dialog.show();
	        translatePage();
	    });	
	} else {
		showCountryDialog.show();
	}	
}

function fillCountryList()
{
	var htm='';
	htm+='<ons-list id="card_expiration">';
	htm+='<ons-list-header class="list-header trn" data-trn-key="expiration_year">Expiration Year</ons-list-header>';
	$.each( country_json_list , function( key, val ) {   
		htm+='<ons-list-item modifier="tappable" onclick="setCardCountry('+"'"+val.code+"'"+');">';
		 htm+='<label class="radio-button checkbox--list-item">';
			htm+='<input type="radio" name="expiration_m" class="expiration_m" value="'+val.code+'"  >';
			htm+='<div class="radio-button__checkmark checkbox--list-item__checkmark"></div>';
			htm+=' '+val.name;
		  htm+='</label>'; 
		htm+='</ons-list-item>';
	});
	htm+='</ons-list>';	
	createElement('country-options-list',htm);	
}

function setCardCountry(country_code)
{
	$(".x_country").val( country_code );
	$(".country_label").html( country_code );
	showCountryDialog.hide();
}

function atzPayNow()
{
    $.validate({ 	
	    form : '#frm-atz',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	    
	    onSuccess : function() {     	      
	       var params = $( "#frm-atz").serialize();
	       params+="&client_token="+getStorage("client_token");
	       params+="&merchant_id="+ getStorage("merchant_id");
	       /*pts*/
	       params+="&earned_points="+ getStorage('earned_points');	       
	       callAjax("PayAtz",params);	       
	       return false;
	    }  
	});
}

function stripePayNow()
{
	var stripe_publish_key = getStorage('stripe_publish_key');
	dump(stripe_publish_key);
	 $.validate({ 	
	    form : '#frm-stp',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	    
	    onSuccess : function() { 
	    	
	       loader.show();
	    	
	       var cards = $(".cc_number").val();       
	       var cvv = $(".cvv").val();  
	       var expiration_month = $(".expiration_month").val();  
	       var expiration_yr = $(".expiration_yr").val(); 
	            
	       Stripe.setPublishableKey(stripe_publish_key);
	       Stripe.card.createToken({
			  number: cards ,
			  cvc: cvv,
			  exp_month: expiration_month ,
			  exp_year: expiration_yr
		   }, stripeResponseHandler);	
		   
	       return false;
	    }  
	});
}

function stripeResponseHandler(status, response)
{
	dump('stripe response');
	dump(status);
	dump(response);
	if (response.error) {
		hideAllModal();
	 	onsenAlert( response.error.message );
	} else {
		$(".stripe_token").val( response.id );
		
	    var params = $( "#frm-stp").serialize();
        params+="&client_token="+getStorage("client_token");
        params+="&merchant_id="+ getStorage("merchant_id");
        callAjax("PayStp",params);	       
	}
}

function autoAddToCart(item_id,price,discount)
{
		
    if ( $("#close_store").val()==2 || $("#merchant_open").val()==1 ){
		onsenAlert( getTrans("This Restaurant Is Closed Now.  Please Check The Opening Times",'restaurant_close') );
		return;
	}
	
	dump(item_id);
	dump(price);
    cart[cart.length]={		  
	  "item_id":item_id,
	  "qty":1,
	  "price":price,
	  "sub_item":[],
	  "cooking_ref":[],
	  "ingredients":[],
	  'order_notes': '',
	  'discount':discount
	};
	dump(cart);
	
	var cart_value={		  
	  "item_id":item_id,
	  "qty":1,
	  "price":price,
	  "sub_item":[],
	  "cooking_ref":[],
	  "ingredients":[],
	  'order_notes': '',
	  'discount':discount
	};

	
	if(saveCartToDb()){
		callAjax("addToCart", "cart="+ JSON.stringify(cart_value) + "&device_id=" + getStorage("device_id") );		
	} else {		
	    //sNavigator.popPage({cancelIfRunning: true}); //back button
	    toastMsg(  getTrans("Item added to cart",'item_added_to_cart') );
	}
	showCartNosOrder();
}

function validateCLient()
{
	$.validate({ 	
	    form : '#frm-signup-validation',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	    
	    onSuccess : function() {     	      
	       var params = $( "#frm-signup-validation").serialize();	       
	       callAjax("validateCLient",params);	       
	       return false;
	    }  
	});
}

function detailsPTS(pts_type)
{
	dump(pts_type);
	var options = {
      animation: 'slide',
      onTransitionEnd: function() {
      	   callAjax('detailsPTS',
		    "client_token="+getStorage("client_token")+"&pts_type="+pts_type
		   );
      } 
    };
    sNavigator.pushPage("detailsPTS.html", options);		
}

function displayPTSdetails(data)
{
	if (data.length>0){
		var htm='<ons-list class="list-dim-text">';
		$.each( data, function( key, val ) {   
		     htm+='<ons-list-item  class="list-item-container" >';
	           htm+='<ons-row class="row">';
	              htm+='<ons-col width="100px" >';
	                htm+=val.date_created;
	              htm+='</ons-col>';
	              htm+='<ons-col >';
	                 htm+=val.label;
	              htm+='</ons-col>';
	              htm+='<ons-col width="20px" >';
	                 htm+=val.points;
	              htm+='</ons-col>';
	           htm+='</ons-row>';
	         htm+='</ons-list-item>';
		});
		htm+='</ons-list>';
		createElement('scroller-pts-details',htm);	
	}
}

function applyRedeem()
{
	
	if ( checkIfhasOfferDiscount() ){
		return false;
	}
	
	/*pts*/
	redeem_points = $(".redeem_points").val();
	if ( redeem_points!="" ){
		var params="redeem_points="+ redeem_points;        
		params+="&client_token="+getStorage("client_token");
		params+="&merchant_id="+ getStorage("merchant_id");
		params+="&voucher_amount="+ $(".voucher_amount").val();
		params+="&subtotal_order="+ getStorage("cart_sub_total");
		
		params+="&cart_sub_total="+ getStorage("cart_sub_total");
		params+="&cart_delivery_charges="+ getStorage("cart_delivery_charges");
		params+="&cart_packaging="+ getStorage("cart_packaging");
		//params+="&cart_tax_amount="+ getStorage("cart_tax_amount");
		params+="&cart_tax="+ getStorage("cart_tax");
		
		if ( empty(getStorage("tips_percentage")) ){
	       setStorage("tips_percentage",0);
	    }
	    params+="&tips_percentage=" + getStorage("tips_percentage");
	
        callAjax("applyRedeemPoints",params);	 
	} else {
		onsenAlert(  getTrans('invalid redeem points','invalid_redeem_points') );
	}
}

function cancelRedeem()
{
	$(".pts_redeem_points").val( '' );
    $(".pts_redeem_amount").val( '' );
    $(".pts_pts").show();
    $(".pts_pts_cancel").hide();
    $(".total-amount").html( prettyPrice(getStorage("order_total_raw")) );
}

function backtoHome()
{
	var options = {     	  		  
  	  closeMenu:true,
      animation: 'slide'	    
   };	   	   	   
   menu.setMainPage('home.html',options);
}

function exitKApp()
{
	ons.notification.confirm({
	  message: getTrans('Are you sure to close the app?','close_app') ,	  
	  title: dialog_title_default ,
	  buttonLabels: [ getTrans('Yes','yes') ,  getTrans('No','no') ],
	  animation: 'default', // or 'none'
	  primaryButtonIndex: 1,
	  cancelable: true,
	  callback: function(index) {
	  	   //alert(index);
	  	   // -1: Cancel
           // 0-: Button index from the left           
	  	   if (index==0){	  	   	      	   	  
				if (navigator.app) {
				   navigator.app.exitApp();
				} else if (navigator.device) {
				   navigator.device.exitApp();
				} else {
				   window.close();
				}
	  	   }
	  }
	});
}

function imageLoaded(div_id)
{	
	$(div_id).imagesLoaded()
	  .always( function( instance ) {
	    console.log('all images loaded');
	  })
	  .done( function( instance ) {
	    console.log('all images successfully loaded');
	  })
	  .fail( function() {
	    console.log('all images loaded, at least one is broken');
	  })
	  .progress( function( instance, image ) {
	    var result = image.isLoaded ? 'loaded' : 'broken';	    	   
	    image.img.parentNode.className = image.isLoaded ? '' : 'is-broken';
	    console.log( 'image is ' + result + ' for ' + image.img.src );	    
	});
}

$( document ).on( "keyup", ".limit_char", function() {
	  var limit=$(this).data("maxl");
	  limit=parseInt(limit);	  
	  limitText(this,limit);
});

function limitText(field, maxChar){
    var ref = $(field),
        val = ref.val();
    if ( val.length >= maxChar ){
        ref.val(function() {
            //console.log(val.substr(0, maxChar))
            return val.substr(0, maxChar);       
        });
    }
}

function toastMsg( message )
{		
	if (isDebug()){
		onsenAlert( message );
		return ;
	}
	 
   /* window.plugins.toast.showWithOptions(
    {
      message: message ,
      duration: "long",
      position: "bottom",
      addPixelsY: -40 
    },
      toastOnSuccess, 
      toastOnError  
    );*/
   
    window.plugins.toast.showWithOptions(
      {
        message: message ,
        duration: "long",
        position: "bottom",
        addPixelsY: -40 
      },
      function(args) {
      	
      },
      function(error) {
      	onsenAlert( message );
      }
    );
}

function isDebug()
{	
	//on/off
	//return true;
	return false;
}

var rzr_successCallback = function(payment_id) {
  //alert('payment_id: ' + payment_id)
    var params="payment_id="+payment_id;
	params+="&order_id="+ getStorage("order_id");
	params+="&client_token="+ getStorage("client_token");	
	callAjax("razorPaymentSuccessfull",params);	  
}

var rzr_cancelCallback = function(error) {
  onsenAlert(error.description + ' (Error '+error.code+')')
}


function showEasyCategory(element)
{
	
	if (typeof myPopover === "undefined" || myPopover==null || myPopover=="" ) { 	    		
		ons.createPopover('popover.html').then(function(popover) {	
		   popover.show(element,{
		   	 animation:"none"
		   });	   
		   createElement("category-pop-over-list", easy_category_list );
	    });	    
	} else {				
		myPopover.show(element);		
		myPopover.on("postshow", function(e) {	
			createElement("category-pop-over-list", easy_category_list );
		});
	}
	      
}


function fillPopOverCategoryList(data)
{		
	var html='<ons-list id="category-popup">';
	if( data.length>0){
	   $.each( data, function( key, val ) {     
	   	  html+='<ons-list-item modifier="tappable" onclick="loadmenu2('+
             val.category_id+','+val.merchant_id+');"  >'+val.category_name+'</ons-list-item>';
	   });	
	}	
	html+='</ons-list>';
	dump(html);		
	easy_category_list=html;
}

function loadmenu2(cat_id,mtid)
{
	callAjax("getItemByCategory","cat_id="+cat_id+"&merchant_id="+mtid);	
	myPopover.hide();
}

function showMenu(element)
{
	if (typeof merhantPopOverMenu === "undefined" || merhantPopOverMenu==null || merhantPopOverMenu=="" ) { 	    		
		ons.createPopover('merchantmenu.html').then(function(popover) {	
		   popover.show(element,{
		   	 animation:"none"
		   });	   		   
		   
		   enabled_table_booking = getStorage('enabled_table_booking');	    
		    if(enabled_table_booking==2){
		    	$(".book_table_menu").show();
		    } else $(".book_table_menu").hide();
		    
		    translatePage();
		    
	    });	    	    	    
	} else {						
		merhantPopOverMenu.show(element);				
		
		merhantPopOverMenu.on("preshow", function(e) {	
			enabled_table_booking = getStorage('enabled_table_booking');	    
		    if(enabled_table_booking==2){
		    	$(".book_table_menu").show();
		    } else $(".book_table_menu").hide();
		});				
		
		translatePage();
	}
}

function loadPageMerchantInfo()
{
	var options = {
      animation: 'none',
      onTransitionEnd: function() { 	 	      	  
      	  displayMerchantLogo2( 
	      	     getStorage("merchant_logo") ,
	      	     '' ,
	      	     'page-merchantinfo'
	      );	  		      
	      callAjax("getMerchantInfo","merchant_id="+ getStorage('merchant_id'));  		      
      } 
    };  
    sNavigator.pushPage("merchantInfo.html", options);	   
    merhantPopOverMenu.hide(); 
}

function loadBookingForm1()
{
	merhantPopOverMenu.hide(); 
	loadBookingForm();
}

function loadMoreReviews1()
{
	merhantPopOverMenu.hide(); 
	loadMoreReviews();
}

function loadMap()
{
	
	merhantPopOverMenu.hide(); 
	//alert( getStorage('merchant_id') );	
	
	var options = {
      animation: 'none',
      onTransitionEnd: function() { 	 
      	  checkGPS();      	        	       
      } 
    };  
    sNavigator.pushPage("map.html", options);	   
}

function checkGPS()
{					 
	 if (isDebug()){
	 	viewTaskMapInit();
		return ;
	 }
	 
	 if ( device.platform =="iOS"){		
	 	viewTaskMapInit(); 	 
	 	 return;
	 }
	 
 	var can_request=true;
	cordova.plugins.locationAccuracy.canRequest(function(canRequest){
	 	 if(!canRequest){	
	 	 	can_request=false;
	 	 	var _message=getTrans('Your device has no access to location Would you like to switch to the Location Settings page and do this manually?','location_off')
		   	   ons.notification.confirm({
				  message: _message,		  
				  title: dialog_title_default ,
				  buttonLabels: ['Yes', 'No'],
				  animation: 'none',
				  primaryButtonIndex: 1,
				  cancelable: true,
				  callback: function(index) {
				     if ( index==0 || index=="0"){
				     	cordova.plugins.diagnostic.switchToLocationSettings();
				     } 
				  }
			 });			   			 
	 	 }
	});
	
	if(!can_request){
		return;
	}

	 
     cordova.plugins.locationAccuracy.request( onRequestSuccessMap, 
	 onRequestFailureMap, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
}

function onRequestSuccessMap(success){
    //alert("Successfully requested accuracy: "+success.message);    
    viewTaskMapInit();
}

function onRequestFailureMap(error){
    //alert("Accuracy request failed: error code="+error.code+"; error message="+error.message);    
    if(error.code == 4){
    	toastMsg( getTrans("You have choosen not to turn on location accuracy",'turn_off_location') );
    	checkGPS();
    } else {
    	toastMsg( error.message );
    }
}


function viewTaskMapInit()
{
	
	if(isDebug()){
		return;
	}
	
	loader.show();
	
	merchant_latitude = getStorage("merchant_latitude");
	merchant_longtitude = getStorage("merchant_longtitude");
	
	//alert('viewTaskMapInit');	
	/*alert( merchant_latitude );
	alert( merchant_longtitude );	*/
	
	google_lat = new plugin.google.maps.LatLng( merchant_latitude , merchant_longtitude );
	
	setTimeout(function(){ 	    
        var div = document.getElementById("map_canvas_div");
        $('#map_canvas_div').css('height', $(window).height() - $('#map_canvas_div').offset().top);
        
        map = plugin.google.maps.Map.getMap(div, {     
	     'camera': {
	      'latLng': google_lat,
	      'zoom': 17
	     }
	    });
        map.setBackgroundColor('white');
        
        map.on(plugin.google.maps.event.MAP_READY, onMapInit); 
        
    }, 500); // and timeout for clear transitions    
}

function onMapInit()
{
			
	merchant_latitude = getStorage("merchant_latitude");
	merchant_longtitude = getStorage("merchant_longtitude");
	delivery_address = getStorage("merchant_address");
	
	var GOOGLE = new plugin.google.maps.LatLng( merchant_latitude , merchant_longtitude);
	
	map.clear();	
	map.off();
	map.setCenter(GOOGLE);
	map.setZoom(17);
					
    map.addMarker({
	  'position': new plugin.google.maps.LatLng( merchant_latitude , merchant_longtitude ),
	  'title': delivery_address ,
	  'snippet': getTrans( "Destination" ,'destination'),
	  'icon': {
	    'url': getStorage("destination_icon")
	   }			  				  
     }, function(marker) {
     	
     	marker.showInfoWindow();

     	navigator.geolocation.getCurrentPosition( function(position) {	    
	    	
     		 
	    	 var your_location = new plugin.google.maps.LatLng(position.coords.latitude , position.coords.longitude); 	
	    	 	    	 
	    	 var destination = new plugin.google.maps.LatLng( merchant_latitude , merchant_longtitude );
	    	 
	    	  map.addPolyline({
			    points: [
			      destination,
			      your_location
			    ],
			    'color' : '#AA00FF',
			    'width': 10,
			    'geodesic': true
			   }, function(polyline) {
			   	
			   	  map.animateCamera({
					  'target': your_location,
					  'zoom': 17,
					  'tilt': 30
					}, function() {
						
					   var data = [      
				          {
				            'title': getTrans('You are here','you_are_here'), 
				            'position': your_location ,
				            'icon': {
							    'url': getStorage("from_icon")
							  }			  				  
				          }  
				       ];
				       
				       hideAllModal();
				   
					   addMarkers(data, function(markers) {
					    markers[markers.length - 1].showInfoWindow();
					   });
						
				   });  
				   
			   });   
	    	 // end position success
	    	 
	      }, function(error){
	      	 hideAllModal();
	    	 toastMsg( error.message );
	    	 // end position error
	      }, 
          { timeout: 10000, enableHighAccuracy : getLocationAccuracy() } 
        );	    	  
     	
     });     
}

function addMarkers(data, callback) {
  var markers = [];
  function onMarkerAdded(marker) {
    markers.push(marker);
    if (markers.length === data.length) {
      callback(markers);
    }
  }
  data.forEach(function(markerOptions) {
    map.addMarker(markerOptions, onMarkerAdded);
  });
}


function getLocationAccuracy()
{
	var networkState = navigator.connection.type;		
	switch (networkState)
	{
		case "Connection.WIFI":
		case "wifi":
		return false;
		break;
		
		default:
		return true;
		break;
	}			
}

function viewTaskDirection()
{
	merchant_latitude = getStorage("merchant_latitude");
	merchant_longtitude = getStorage("merchant_longtitude");
	
	navigator.geolocation.getCurrentPosition( function(position) {	    
   	         
         var your_location = new plugin.google.maps.LatLng(position.coords.latitude , position.coords.longitude); 	        
         //demo
         //var yourLocation = new plugin.google.maps.LatLng(34.039413 , -118.25480649999997); 	        
         
         var destination_location = new plugin.google.maps.LatLng(merchant_latitude , merchant_longtitude); 	        
         
         plugin.google.maps.external.launchNavigation({
	         "from": your_location,
	         "to": destination_location
	      });	

    	 // end position success    	 
      }, function(error){
    	 toastMsg( error.message );
    	 // end position error
      }, 
      { timeout: 10000, enableHighAccuracy : getLocationAccuracy() } 
    );	    	  		
	
}

function initIntelInputs()
{
	 var mobile_country_code=getStorage("mobile_country_code");
	 dump(mobile_country_code);
	 if(!empty(mobile_country_code)){
	 	 $(".mobile_inputs").intlTelInput({      
		    autoPlaceholder: false,		      
		    defaultCountry: mobile_country_code,  
		    autoHideDialCode:true,    
		    nationalMode:false,
		    autoFormat:false,
		    utilsScript: "lib/intel/lib/libphonenumber/build/utils.js"
		 });
	 } else {
		 $(".mobile_inputs").intlTelInput({      
		    autoPlaceholder: false,		        
		    autoHideDialCode:true,    
		    nationalMode:false,
		    autoFormat:false,
		    utilsScript: "lib/intel/lib/libphonenumber/build/utils.js"
		 });
	 }
}

function showVerifyAccountPage()
{
	 var options = {
	      animation: 'slide',
	      onTransitionEnd: function() {	      	  
	      } 
	  }; 
	  sNavigator.pushPage("verify-account.html", options);
}

function verifyAccount()
{
	$.validate({ 	
	    form : '#frm-verify-account',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	    
	    onSuccess : function() {     	      
	      var params = $( "#frm-verify-account").serialize();	      	      
	      callAjax("verifyAccount",params);	       
	      return false;
	    }  
	});
}

function checkIfhasOfferDiscount()
{
	var has_discount = getStorage("has_discount");	
	if(!empty(has_discount)){
		if(has_discount==1){
		   onsenAlert(  getTrans('you request cannot be applied you have offer discount already','discount_offer') );
		   return true;
		}
	}
	return false;
}

function showPageAdressSelection()
{
	var options = {
      animation: 'slide',
      onTransitionEnd: function() {         	   	 
      } 
   };   
   sNavigator.pushPage("address-selection.html", options);
}

function showManualAddressInput()
{
	$(".manual-address-input").toggle();
}

function setManualAddress()
{
	$.validate({ 	
	    form : '#frm-manual-address',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	    
	    onSuccess : function() {     	      
	       $(".street").val( $(".stree_1").val()  );	
	       $(".city").val( $(".city_1").val()  );	
	       $(".state").val( $(".state_1").val()  );	
	       $(".zipcode").val( $(".zipcode_1").val()  );		
	       
	       var complete_address = $(".stree_1").val();
	       complete_address+=" "+ $(".city_1").val();
	       complete_address+=" "+ $(".state_1").val();
	       complete_address+=" "+ $(".zipcode_1").val();	       
	       
           $(".google_lat").val( '' );	
		   $(".google_lng").val( '' );	
		   $(".formatted_address").val( '' );			
	       
	       $(".delivery-address-text").html( complete_address );       
	       sNavigator.popPage({cancelIfRunning: true});    
	       return false;
	    }  
	});
}

function showMapAddress(map_address_action)
{
	setStorage("map_address_action",map_address_action)
	
	var options = {
      animation: 'none',
      onTransitionEnd: function() {       	 
      	 checkGPS_AddressMap();
      } 
    };   
    sNavigator.pushPage("address-bymap.html", options);		
}


function checkGPS_AddressMap()
{
	
	$('#map_canvas_address').css('height', $(window).height() - $('#map_canvas_address').offset().top);
	
	if ( $(".search_address_geo").exists() ){
		
		dump('checkGPS_AddressMap');
		$('.map_search_field_wrap').css('height',"auto");
		
		$( document ).on( "click", "#search_address_geo", function() {    	     	    
		   $('.map_search_field_wrap').css('height', $(window).height() - $('.map_search_field_wrap').offset().top);
		   $(".search_address_geo").val('');
		});
		
		var country_code_set=getStorage("country_code_set");
		if ( empty(getStorage("country_code_set")) ){
			country_code_set='';
		}		
		$(".search_address_geo").geocomplete({
		   country: country_code_set
	    }).bind("geocode:result", function(event, result){	    	    		    	    		        
	    	
	    	 dump(result);    
	    	 
	    	 $('.map_search_field_wrap').css('height',"auto");
	    	 
	    	 var address = "", city="", state="" ;			 			 
			 var zip = "", formatted_address="", s_lat='', s_lng=''; 

			 formatted_address=result.formatted_address;
			 
	    	 $.each(result.address_components, function(){
	            switch(this.types[0]){
	                case "postal_code":
	                    zip = this.short_name;
	                    break;
	                case "street_address":
	                    address = this.short_name;
	                    break;
	                case "administrative_area_level_1":
	                    state = this.short_name;
	                    break;
	                case "locality":
	                    city = this.short_name;
	                    break;                  
	            }
	        });
	        
	        dump("formatted_address=>"+formatted_address);
	        dump("address=>"+address);
	        dump("city=>"+city);
	        dump("state=>"+state);
	        dump("zip=>"+zip);
	    	 
	         s_lat = result.geometry.location.lat();
	         s_lng = result.geometry.location.lng();
	         
	         if(!isDebug()){
		         var geo_loc = new plugin.google.maps.LatLng( s_lat , s_lng );	
		         	         
		         map_search.getCameraPosition(function(camera) {
		         	
		         	 map_search.setCenter(geo_loc);
		             map_search.setZoom(camera.zoom);
			         drag_marker.setPosition(geo_loc);
			         drag_marker.setTitle( formatted_address );
		             drag_marker.showInfoWindow();	             
			         	
		         });		         
	         }
             
	         var map_address_action=getStorage("map_address_action");
	         dump(map_address_action);
	         	         
	         setStorage("map_address_result_address", address );
			 setStorage("map_address_result_city", city );
			 setStorage("map_address_result_state",state);
			 setStorage("map_address_result_zip",zip);				
			 setStorage("map_address_result_formatted_address",formatted_address);
			 
			 setStorage("google_lat", result.geometry.location.lat() );
			 setStorage("google_lng", result.geometry.location.lng() );
			 
	    });
	} /*end search geo*/
	
	if(isDebug()){
		return;
	}
		
	if ( device.platform =="iOS"){		
	 	 MapInit_addressMap(); 
	 	 return;
	}
	
	
	var can_request=true;
	cordova.plugins.locationAccuracy.canRequest(function(canRequest){
	 	 if(!canRequest){	
	 	 	can_request=false;
	 	 	var _message=getTrans('Your device has no access to location Would you like to switch to the Location Settings page and do this manually?','location_off')
		   	   ons.notification.confirm({
				  message: _message,		  
				  title: dialog_title_default ,
				  buttonLabels: ['Yes', 'No'],
				  animation: 'none',
				  primaryButtonIndex: 1,
				  cancelable: true,
				  callback: function(index) {
				     if ( index==0 || index=="0"){
				     	cordova.plugins.diagnostic.switchToLocationSettings();
				     } 
				  }
			 });			   			 
	 	 }
	});
	
	if(!can_request){
		return;
	}

	
	cordova.plugins.locationAccuracy.request( function(success){
		
		MapInit_addressMap();
		
	} ,  function(error){
		
		if(error.code == 4){	    	
	    	checkGPS_AddressMap();
	    } else {
	    	toastMsg( error.message );
	    }
		
	} , cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
}

function MapInit_addressMap()
{
	
	 loader.show();
	
	 drag_marker_bounce=1;
	
     navigator.geolocation.getCurrentPosition( function(position) {
		
	 var your_location = new plugin.google.maps.LatLng( position.coords.latitude , position.coords.longitude ); 	
	
		setTimeout(function(){ 	    
			
	        var div = document.getElementById("map_canvas_address");
	        $('#map_canvas_address').css('height', $(window).height() - $('#map_canvas_address').offset().top);
	        	        
	        map_search = plugin.google.maps.Map.getMap(div, {     
			         'camera': {
			         'latLng': your_location,
			         'zoom': 17
			        }
			      });
			    
		        map_search.setBackgroundColor('white');

		        map_search.addEventListener(plugin.google.maps.event.MAP_READY, function onMapInit(map) {		        	
		        	
		        	map_search.clear();	
		        	map_search.off();
		        	map_search.setCenter(your_location);
		        	map_search.setZoom(17);
		        	
		        	callAjax("coordinatesToAddress","lat=" + position.coords.latitude + "&lng="+ position.coords.longitude );	 
		        	
		        	
		        	map_search.addEventListener(plugin.google.maps.event.MAP_CLICK, function onMapClick(latLng) {		        	
	                     //alert("Map was long clicked.\n" + latLng.toUrlValue());
	                     var lat_lng= latLng.toUrlValue();
	                     lat_lng=explode(",",lat_lng);
	                     /*alert(lat_lng[0]);
	                     alert(lat_lng[1]);*/
		            });/* even listner*/
		            
		            map_search.addEventListener(plugin.google.maps.event.CAMERA_CHANGE, function onMapCamera(position) {
	                    //alert(JSON.stringify(position));
	                    /*alert( position.target.lat );
	                    alert( position.target.lng );*/
	                    
	                    //drag_marker.remove();	                    
	                    
	                    var new_location = new plugin.google.maps.LatLng( position.target.lat , position.target.lng );
	                    /*map_search.addMarker({
						  'position': new_location
						}, function(marker) {							
							drag_marker=marker;
	                    });*/
	                    
	                    if(drag_marker_bounce==2){
		                    //toastMsg('CAMERA CHANGE =>' + position.target.lat );
		                    drag_marker.setPosition(new_location);
		                    drag_marker.hideInfoWindow();
		                    		                    
		                    $(".change_cemara_action").val("getAddress");
		                    $(".change_cemara_lat").val(  position.target.lat );
		                    $(".change_cemara_lng").val( position.target.lng );
		                    
		                    $(".use-location").html( getTrans("Get Address",'get_address') );
	                    }
	                    
	                    /*if(drag_marker_bounce==2){
	                       callAjax("coordinatesToAddress","lat=" + position.target.lat + "&lng="+ position.target.lng );	 
	                    }*/
	                    
		            });/* even listner*/
		        	
		       });/* even listner*/
		       		       
		       	
	    }, 500); // and timeout for clear transitions    
		
	
	  }, function(error){
	  	 hideAllModal();
    	 toastMsg( error.message );    	 
      }, 
      { timeout: 10000, enableHighAccuracy : getLocationAccuracy() } 
    );	   
}

function useThisLocation()
{	
	
	var data_action=$(".change_cemara_action").val();
	//toastMsg(data_action);
	if ( data_action=="getAddress"){
		var lat = $(".change_cemara_lat").val();
		var lng = $(".change_cemara_lng").val();
		//toastMsg( lat + "=>"+ lng );
		$(".change_cemara_action").val('');
		$(".use-location").html( getTrans("Use this address",'use_this_address') );
		callAjax("dragMarker","lat=" + lat + "&lng="+ lng );	 
		return;
	}
	
	var map_address_action=getStorage("map_address_action");
	//alert(map_address_action);
	dump(map_address_action);
	
	switch (map_address_action){
		case "mapaddress":
		
		    //remove this when going live
		    if(isDebug()){
		    	$(".street").val( "Ciudad de Calamba Road" );
				$(".city").val( "Calamba" );
				$(".state").val( "Calabarzon" );
				$(".zipcode").val( "" );	
				
				$(".google_lat").val( "14.187671199999999" );	
				$(".google_lng").val( "121.1250825" );	
				$(".formatted_address").val( "Ciudad de Calamba Rd, Calamba, Laguna, Philippines" );	
				
				$(".delivery-address-text").html( "Ciudad de Calamba Rd, Calamba, Laguna, Philippines" );  
				
				sNavigator.popPage({cancelIfRunning: true}); //back button
		        sNavigator.popPage({cancelIfRunning: true}); //back button    
		    	return;
		    }
		
		    $(".street").val( getStorage("map_address_result_address") );
			$(".city").val( getStorage("map_address_result_city") );
			$(".state").val( getStorage("map_address_result_state") );
			$(".zipcode").val( getStorage("map_address_result_zip") );	
			
			$(".google_lat").val( getStorage("google_lat") );	
			$(".google_lng").val( getStorage("google_lng") );	
			$(".formatted_address").val( getStorage("map_address_result_formatted_address") );	
			
			$(".delivery-address-text").html( getStorage("map_address_result_formatted_address") );  
			
		    sNavigator.popPage({cancelIfRunning: true}); //back button
		    sNavigator.popPage({cancelIfRunning: true}); //back button    
		break;
		
		case "changeaddress":
		
		   sNavigator.popPage({cancelIfRunning: true}); //back button
		   setStorage("search_address", getStorage("map_address_result_formatted_address") );		   
		   
		   var cart_params=JSON.stringify(cart);       			     
		   if (saveCartToDb()){
		      var cart_params='';
		   }
			
		   callAjax("loadCart","merchant_id="+ getStorage('merchant_id')+"&search_address=" + 
		   encodeURIComponent( getStorage("search_address") ) + "&cart="+cart_params +"&transaction_type=" +
		   getStorage("transaction_type") + "&device_id="+ getStorage("device_id") );
		   
		   sNavigator.popPage({cancelIfRunning: true}); //back button
		   sNavigator.popPage({cancelIfRunning: true}); //back button
		   
		break;
		
		default: 
		  sNavigator.popPage({cancelIfRunning: true}); //back button
		break;
	}			
}

function showChangeAddressPage(object)
{
   var options = {
      animation: 'slide',
      onTransitionEnd: function() {       	  
      } 
   };   
   sNavigator.pushPage("change-address.html", options);
}

function showOrderOptions(order_id)
{
	dump(order_id);
	var options = {
      animation: 'none',
      onTransitionEnd: function() {     
      	  $(".order_option_order_id").val( order_id );  	  
      } 
   };   
   sNavigator.pushPage("order-options.html", options);
}

function showOrderDetails2()
{
	showOrderDetails( $(".order_option_order_id").val() ); 
}

function reOrder2()
{
	reOrder( $(".order_option_order_id").val() );
}

function showTrackPage()
{	
	var options = {
      animation: 'slide',
      onTransitionEnd: function() {     
      	        	
      	  //$('.track-status-wrap').css('height', $(window).height() - $('.track-status-wrap').offset().top - 80  );
      	
      	  var params='order_id=' + $(".order_option_order_id").val();
      	  params+="&client_token="+getStorage("client_token");
		  callAjax("trackOrderHistory",params);	       	 
		  
		  stopTrackInterval();
		  //track_order_interval = setInterval(function(){runTrackOrder()}, 7000);
		  		  
      } 
   };   
   sNavigator.pushPage("track-order.html", options);
}

function showTrackingPage()
{
	var options = {
      animation: 'none',
      onTransitionEnd: function() {        
      	
      	  $(".driver_avatar").attr("src", $(".driver_avatar").val() );
      	  $("._driver_name").html( $(".driver_name").val() );
      	  $(".call_driver").attr("href","tel:"+ $(".driver_phone").val() );
      	  	  
      	  MapInit_Track();
      	  
      	  /*stopTrackMapInterval();
      	  track_order_map_interval = setInterval(function(){runTrackMap()}, 7000);*/
      } 
   };   
   sNavigator.pushPage("tracking-page.html", options);
}

function MapInit_Track()
{
	if(isDebug()){
		return ;
	}
	
	var driver_lat=$(".driver_lat").val();
	var driver_lng=$(".driver_lng").val();
	
	var task_lat=$(".task_lat").val();
	var task_lng=$(".task_lng").val();
	
	
	var driver_location = new plugin.google.maps.LatLng( driver_lat , driver_lng );
	var destination = new plugin.google.maps.LatLng( task_lat , task_lng );
	
	setTimeout(function(){ 	    
		
        var div = document.getElementById("map_canvas_track");
        $('#map_canvas_track').css('height', $(window).height() - $('#map_canvas_track').offset().top);
        	        
	         map = plugin.google.maps.Map.getMap(div, {     
		         'camera': {
		         'latLng': driver_location,
		         'zoom': 17
		        }
		      });
		    
	        map.setBackgroundColor('white');

	        map.addEventListener(plugin.google.maps.event.MAP_READY, function onMapInit2(map) {		        	
	        		        	
	        	map.clear();	
	        	map.off();
	        	map.setCenter(driver_location);
	        	map.setZoom(17);
	        		        	 	        	
	        	 map.addMarker({
				  'position': driver_location ,
				  'title': $(".driver_name").val(),
				  'snippet': getTrans( "Driver name" ,'driver_name'),
				  'icon': {
				    'url': $(".driver_icon").val()
				  }			  				  
			     }, function(marker) {
			     	
	        	       marker.showInfoWindow();	        	       
	        	       
	        	        map.addPolyline({
						    points: [
						      driver_location,
						      destination
						    ],
						    'color' : '#AA00FF',
						    'width': 10,
						    'geodesic': true
						   }, function(polyline) {
						   	
						   	  map.animateCamera({
								  'target': destination,
								  'zoom': 17,
								  'tilt': 30
								}, function() {
									
								   var data = [      
							          { 
							            'title': $(".delivery_address").val() , 							            
							            'position': destination ,
							            'snippet': getTrans( "Delivery Address" ,'delivery_address'),
							            'icon': {
									       'url': $(".address_icon").val()
									    }
							          }  
							       ];												      
							       
								   addMarkers(data, function(markers) {
								      markers[markers.length - 1].showInfoWindow();
								      markers[markers.length - 1].setAnimation(plugin.google.maps.Animation.BOUNCE);
								   });
									
							   });  
							   
						 });   
				    	 // end addPolyline
				    	 
				    	 stopTrackMapInterval();
      	                 track_order_map_interval = setInterval(function(){runTrackMap()}, 10000);
	        	       
			     });  /*end marker*/ 
			     	
	       });/* even listner*/
        
	    }, 500); // and timeout for clear transitions      
}


function submitContactForm()
{
	$.validate({ 	
	    form : '#frm-enter-contact',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	    
	    onSuccess : function() {     	      
	      var params = $( "#frm-enter-contact").serialize();	      
	      params+="&client_token="+ getStorage('client_token');
	      callAjax("saveContactNumber",params);	       
	      return false;
	    }  
	});
}

function playNotification()
{	 
	 var sound_url= "file:///android_asset/www/audio/fb-alert.mp3";
	 dump(sound_url);
	 if(!empty(sound_url)){
        playAudio(sound_url);
	 }
}

var my_media;

function playAudio(url) {
    // Play the audio file at url    
    my_media = new Media(url,
        // success callback
        function () {
            dump("playAudio():Audio Success");
            my_media.stop();
            my_media.release();
        },
        // error callback
        function (err) {
            dump("playAudio():Audio Error: " + err);
        }
    );
    // Play audio
    my_media.play();
}

function stopNotification()
{
	my_media.stop();
    my_media.release();
}

function saveCartToDb()
{
	var mobile_save_cart_db= getStorage("mobile_save_cart_db");
	if(mobile_save_cart_db==1){
		return true;
	}
	return false;
}

function runTrackOrder()
{
	if ($('#page-track-order').is(':visible')) {	
	   dump("runTrackOrder");
	   var params='order_id=' + $(".order_option_order_id").val();
       params+="&client_token="+getStorage("client_token");
       callAjax("trackOrderHistory",params);	       	 
	} else {
		dump("stop runTrackOrder");
		stopTrackInterval();
	}
}

function reRunTrackOrder(){
   stopTrackInterval();
   track_order_interval = setInterval(function(){runTrackOrder()}, 7000);	
}

function reRunTrackOrder2()
{	
	sNavigator.popPage({cancelIfRunning: true}); //back button
	stopTrackInterval();
    track_order_interval = setInterval(function(){runTrackOrder()}, 7000);	
}

function stopTrackInterval() {
    clearInterval(track_order_interval);
}

function stopTrackMapInterval() {
    clearInterval(track_order_map_interval);
}

function runTrackMap()
{	
	if ($('#tracking-page').is(':visible')) {	
	   dump("runTrackMap");
	   stopTrackMapInterval();
	   var params='order_id=' + $(".order_option_order_id").val();
       params+="&client_token="+getStorage("client_token");
       callAjax("trackOrderMap",params);	       	 
	} else {
		dump("stop runTrackMap");
		stopTrackMapInterval();
	}
}

function reInitTrackMap(data)
{
	dump('reInitTrackMap');
	dump(data);
    var driver_lat = data.driver_lat;
	var driver_lng = data.driver_lng;
	
	var task_lat = data.task_lat;
	var task_lng = data.task_lng;
	
	if(isDebug()){
		dump("driver location=>" + driver_lat + ":"+ driver_lng);
		dump("task location=>" + task_lat + ":"+ task_lng);
		return;
	}
	
	var driver_location = new plugin.google.maps.LatLng( driver_lat , driver_lng );
	var destination = new plugin.google.maps.LatLng( task_lat , task_lng );
		
	map.getCameraPosition(function(camera) {
	  var data = ["Current camera position:\n",
	      "latitude:" + camera.target.lat,
	      "longitude:" + camera.target.lng,
	      "zoom:" + camera.zoom,
	      "tilt:" + camera.tilt,
	      "bearing:" + camera.bearing].join("\n");
	      
	      //toastMsg(data);
			
	    var camera_location = new plugin.google.maps.LatLng( camera.target.lat , camera.target.lng );  
		
		map.clear();	
		map.off();
		map.setCenter(camera_location);
		map.setZoom(camera.zoom);
			     
	    var data = [      
		 { 
	        'title': $(".driver_name").val(),
	        'position': driver_location ,
	        'snippet': getTrans( "Driver name" ,'driver_name'),
	        'icon': {
		       'url': $(".driver_icon").val()
		    }
	      },{ 
	        'title': $(".delivery_address").val() , 							            
	        'position': destination ,
	        'snippet': getTrans( "Delivery Address" ,'delivery_address'),
	        'icon': {
		       'url': $(".address_icon").val()
		    }
	      }  
	    ];
	    
	    addMarkers(data, function(markers) {       
	    	
	    	map.addPolyline({
			points: [
			  driver_location,
			  destination
			],
			'color' : '#AA00FF',
			'width': 10,
			'geodesic': true
			}, function(polyline) {
			   
			});   							   
	    	
	    });
	   
	    stopTrackMapInterval();
		track_order_map_interval = setInterval(function(){runTrackMap()}, 9000);   

	});
}

function showTip()
{		
	if (typeof tipsDialog === "undefined" || tipsDialog==null || tipsDialog=="" ) { 	    
		ons.createDialog('tipsDialog.html').then(function(dialog) {
			$(".cash_tip").val('');
			dialog.show();
	        translatePage();   
	        $(".cash_tip").attr("placeholder",  getTrans("Cash Tip",'cash_tip') );
	    });	
	} else {
		$(".cash_tip").val('');
		tipsDialog.show();
	}	
}

function setTips(tips)
{	
	removeStorage("remove_tips");
	setStorage("tips_percentage",tips);
	$(".tip_amount").html( getTrans("Tips",'tips') + " "+ tips+"%" );
	tipsDialog.hide();
	reloadCart();
}

function removeTips()
{
	removeStorage("tips_percentage");
	setStorage("remove_tips",1);
	tipsDialog.hide();
	reloadCart();
}

function reloadCart()
{
	var cart_params=JSON.stringify(cart);       	        	  
	if (saveCartToDb()){
	  	  var cart_params='';
	}      	  
	        	 
    if ( empty(getStorage("tips_percentage")) ){
	   setStorage("tips_percentage",0);
	}
	
	var params='';
	params="merchant_id="+ getStorage('merchant_id');
	params+="&search_address=" + encodeURIComponent(getStorage("search_address"))
	params+="&cart="+cart_params;
	params+="&transaction_type=" + getStorage("transaction_type");
	params+="&device_id="+ getStorage("device_id");
	params+="&tips_percentage=" + getStorage("tips_percentage");
		
	if (!empty( getStorage("remove_tips") )){
		params+="&remove_tips="+getStorage("remove_tips");
	}
	  
	callAjax("loadCart",params); 	
}

function fillCCList(data)
{
	var html='';
	if (data.length>0){
	  $.each( data, function( key, val ) { 
	  	  html+='<ons-list-item modifier="tappable" onclick="setCC('+val.cc_id+');" >';
	  	  html+=val.credit_card_number;
	  	  html+='</ons-list-item>';
	  });
	  createElement("cc-list", html );
	}
}

function setCC(cc_id)
{
	/*dump(cc_id);
	setStorage("cc_id",cc_id);
	sNavigator.popPage({cancelIfRunning: true});*/
	
	ons.notification.confirm({
	  message: getTrans('Choose action','choose_action'),  
	  title: '',
	  buttonLabels: [ getTrans('Use this card','use_this_card') , getTrans('Edit this card','edit_this_card')  ],
	  animation: 'default', // or 'none'
	  primaryButtonIndex: 1,
	  cancelable: true,
	  callback: function(index) {
	  	  dump(index);
	      switch (index)
	      {
	      	 case 0:
	      	 setStorage("cc_id",cc_id);
	         sNavigator.popPage({cancelIfRunning: true});
	      	 break;
	      	 
	      	 case 1:
	      	  var options = {
			      animation: 'slide',
			      onTransitionEnd: function() {         	   	 
			      	  translatePage();
				      translateValidationForm();				      
				      var params="&client_token="+ getStorage("client_token");
				      params+="&cc_id="+cc_id;
				      callAjax("loadCC",params);	       
			      } 
			   };   
			   sNavigator.pushPage("ccform.html", options);
	      	 break;
	      }
	  }
   });
	
}

function showCCForm()
{
    var options = {
      animation: 'slide',
      onTransitionEnd: function() {         	   	 
      	  translatePage();
	      translateValidationForm();
	      $(".delete-cc").hide();
	      
	      $(".cc_number").attr("placeholder",  getTrans("Credit Card Number",'cc_number') );
	      $(".cvv").attr("placeholder",  getTrans("CVV",'cvv') );
	      $(".card_name").attr("placeholder",  getTrans("Card name",'card_name') );	      
	      $(".billing_address").attr("placeholder",  getTrans("Billing Address",'billing_address') );
	      
      } 
   };   
   sNavigator.pushPage("ccform.html", options);
}

function saveCC()
{
	$.validate({ 	
	    form : '#frm-cc',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	    
	    onSuccess : function() {     	      
	      var params = $( "#frm-cc").serialize();	      	      
	      params+="&client_token="+ getStorage("client_token");
	      callAjax("saveCreditCard",params);	       
	      return false;
	    }  
	});
}

function deleteCC()
{	
	ons.notification.confirm({
	  message: getTrans('Delete this records?','delete_this_records') ,	  
	  title: dialog_title_default,
	  buttonLabels: ['Yes', 'No'],
	  animation: 'default', // or 'none'
	  primaryButtonIndex: 1,
	  cancelable: true,
	  callback: function(index) {	  	
	    if ( index==0){
	    	var params='';
	        params+="&client_token="+ getStorage("client_token");
	        params+="&cc_id="+ $(".cc_id").val() ;	
	        callAjax("deleteCreditCard",params);	       
	    }
	  }
	});		
}

function fillShippingAddress()
{
	if ( !empty( getStorage("map_address_result_formatted_address") )){
  	     $(".delivery-address-text").html( getStorage("map_address_result_formatted_address") );
  	     $(".street").val( getStorage("map_address_result_address") );
		 $(".city").val( getStorage("map_address_result_city") );
		 $(".state").val( getStorage("map_address_result_state") );
		 $(".zipcode").val( getStorage("map_address_result_zip") );	
		 $(".formatted_address").val( getStorage("map_address_result_formatted_address") );	
		 
		 $(".google_lat").val( getStorage("google_lat") );	
		 $(".google_lng").val( getStorage("google_lng") );	
  	 } 
}

function monerisPay()
{	
	 $.validate({ 	
	    form : '#frm-mri',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	    
	    onSuccess : function() { 
	    		      
	       var cards = $(".cc_number").val();       	       
	       var expiration_month = $(".expiration_month").val();  
	       var expiration_yr = $(".expiration_yr").val(); 
	            	      
	       params="cards="+cards;
	       params+="&expiration_month="+expiration_month;
	       params+="&expiration_yr="+expiration_yr;
	       
	       params+="&order_id="+$("#order_id").val();
	       params+="&currency_code="+$("#currency_code").val();
	       params+="&paymet_desc="+$("#paymet_desc").val();
	       params+="&total_w_tax="+$("#total_w_tax").val();
	       params+="&merchant_id="+ getStorage("merchant_id");
	       params+="&client_token="+getStorage("client_token");
	       
	       params+="&cvv="+ $(".cvv").val(); 
	       
	       callAjax("monerisPay",params);
	       return false;
	    }  
	});
}

function applyCashTip()
{
	if ( $(".cash_tip").val() ==""){
		 onsenAlert(   getTrans('Cash Tip is required','cash_tip_required')  );
		 return;
	}
	var tip_raw = $(".cash_tip").val();
	var order_sub_total = getStorage("order_sub_total_raw");
	
	
	if (!empty(order_sub_total)){				
		//dump( tip_raw + "/"+ order_sub_total );
	    var reverse_percentage = ( parseFloat(tip_raw)/parseFloat(order_sub_total))*100;
	    dump(reverse_percentage); dump( reverse_percentage.toFixed() );
	    var tips=reverse_percentage.toFixed();	    
	    setStorage("tips_percentage",tips);
		$(".tip_amount").html( getTrans("Tips",'tips') + " "+ tips+"%" );
		tipsDialog.hide();
		reloadCart();	    
	}	
}

function initSlideMenu()
{	
   menu.on('preopen', function() {
       console.log("Menu page is going to open");
       
       if (isLogin()){
       	   dump('logon ok');
       	   
       	   var pts = getStorage("pts");
	       dump("pts=>"+pts);
	       if(pts!=2){
	       	  $(".menu-pts").hide();
	       } else {
	       	  $(".menu-pts").css({"display":"block"});
	       }
	              	   
       	   $(".logout-menu").css({"display":"block"});
       	   
       	   var avatar=getStorage("avatar");
       	   dump("avatar=>"+avatar);       	   
       	   if(!empty(avatar)){
       	   	   dump('fillavatar');
	       	   $(".profile-pic-wrap").show();
	       	   $(".avatar").attr("src", getStorage("avatar") );
	       	   $(".avatar-right").html(  getStorage("client_name_cookie") );
	       	   $(".avatar-wrap-menu div").addClass("img_loaded");
       	   }
       } else {
       	   dump('logon not');
       	   $(".logout-menu").hide();
       	   $(".profile-pic-wrap").hide();
       	   $(".menu-pts").hide();
       }
       
       translatePage();    
          
  });  
  menu.on('postopen', function() {
      dump('menu is open');      
      imageLoaded('.img_loaded');
  });	
}

function InitPlaceOrder()
{
	$.validate({ 	
	    form : '#frm-paymentoption',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	    
	    onSuccess : function() {     	
	    	placeOrder();
			
			if(!isDebug()){
   		//Tag OneSignal para cada estabelecimento quando o cliente compra.
		var keyOneSignal = getStorage('merchant_id');
		//var keyOneSignal = getStorage('merchant_name'); //Usa-se o nome da empresa
  		window.plugins.OneSignal.sendTag(""+keyOneSignal+"", "comprou");
			}
	        return false;
	    }  
	});   
}