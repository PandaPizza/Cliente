link_google_play = getStorage("link_google_play");
dump("link_google_play=>"+link_google_play);
link_apple_store = getStorage("link_apple_store");
dump("link_apple_store=>"+link_apple_store);

function AtualizarApp(){


	if(device.platform=="Android"){
	// cordova.InAppBrowser.open('market://details?id=app.pandapizza.cliente', '_system', 'location=yes');
  //  window.location.replace("market://details?id=app.pandapizza.cliente");
		cordova.plugins.market.open(link_google_play);
  }else {
		cordova.plugins.market.open(link_apple_store);
		// cordova.InAppBrowser.open('itms://itunes.apple.com/br/app/masterhub/id1143525346', '_system', 'location=yes');
  //  window.location.replace("itms://itunes.apple.com/br/app/masterhub/id1143525346");
  }

}
