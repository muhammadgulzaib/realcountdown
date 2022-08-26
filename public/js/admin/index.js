$("table").on("click", 'input[value="Delete"]', function (e) {
  $(this).closest("tr").remove();
});
