const FlexSearch = require('flexsearch');
console.log('FlexSearch exports:', Object.keys(FlexSearch));
console.log('FlexSearch.Document:', FlexSearch.Document);
try {
  const { Document } = require('flexsearch');
  console.log('Named Document export:', Document);
} catch (e) {
  console.log('Named import failed');
}
