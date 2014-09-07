// Saves options to chrome.storage
function save_options() {
  var bucket = document.getElementById("qn-bucket").value;
  var ak = document.getElementById('qn-ak').value;
  var pk = document.getElementById('qn-pk').value;
  chrome.storage.sync.set({
	bucket:bucket,
    ak: ak,
    pk: pk
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

document.getElementById('btn-save').addEventListener('click',save_options);

window.onload = function(){
	chrome.storage.sync.get(function(data){
		console.log(data);
		document.getElementById('qn-bucket').value = data.bucket || "";
		document.getElementById('qn-ak').value = data.ak || "";
		document.getElementById('qn-pk').value = data.pk || "";
	});
	
};