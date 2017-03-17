import moment from "moment";

var data;

function init (d) {
  data = _(d)
  .sortBy("date")
  .map(
    item => _(item)
      .assign({
        date: (item.date ? moment(item.date) : moment(item.year))
      })
      .value()
  )
  .value();

  span();
}

function span (density = 1) {
  const { min: min, max: max } = (function () { // Note: destructuring, with local names
    const d = _(data).map(item => item.date).value();
    return {
      min: moment.min(d),
      max: moment.max(d)
    };
  })();

  console.log(min, max);
}





export default {
  data: () => data,
  init: init
};