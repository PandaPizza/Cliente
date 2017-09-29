
function AtualizarApp(){


	if(device.platform=="Android"){
	// cordova.InAppBrowser.open('market://details?id=app.pandapizza.cliente', '_system', 'location=yes');
  //  window.location.replace("market://details?id=app.pandapizza.cliente");
		cordova.plugins.market.open('app.pandapizza.cliente');
  }else {
		cordova.plugins.market.open('id1143525346');
		// cordova.InAppBrowser.open('itms://itunes.apple.com/br/app/masterhub/id1143525346', '_system', 'location=yes');
  //  window.location.replace("itms://itunes.apple.com/br/app/masterhub/id1143525346");
  }

}
