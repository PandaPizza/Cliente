
function fbShare(){
	window.plugins.socialsharing.shareViaFacebook('Eu pedi online e entregaram mais rápido que por telefone. Baixe o aplicativo da Playstore. ', 
                                                 null /* img */, 
                                                 "https://play.google.com/store/apps/details?id=app.masterhub.cliente&hl=pt-BR", 
                                                 null, 
                                                 function(errormsg){alert("Erro: Não foi compartilhado")}
                                                 );
};
 
function whatsappShare(){
	window.plugins.socialsharing.shareViaWhatsApp('Eu pedi online e entregaram mais rápido que por telefone. Baixe o aplicativo da Playstore. ', 
                                                 null /* img */, 
                                                 "https://play.google.com/store/apps/details?id=app.masterhub.cliente&hl=pt-BR", 
                                                 null, 
                                                 function(errormsg){alert("Erro: Não foi compartilhado")}
                                                 );
};
 
function twitterShare(){
	 window.plugins.socialsharing.shareViaTwitter('Eu pedi online e entregaram mais rápido que por telefone. Baixe o aplicativo da Playstore. ', 
                                                 null /* img */, 
                                                 "https://play.google.com/store/apps/details?id=app.masterhub.cliente&hl=pt-BR", 
                                                 null, 
                                                 function(errormsg){alert("Erro: Não foi compartilhado")}
                                                 );
  };