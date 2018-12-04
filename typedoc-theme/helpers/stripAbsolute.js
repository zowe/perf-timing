const DEBUG = false;

console.log("Loaded stripAbsolute helper");

module.exports = {
  stripAbsolute: (fileName) => {
    return fileName.replace(/^(.*?)(node_modules.*)$/gm, function(substring, p1, p2) {
      if(DEBUG) {
        process.nextTick(() => {
          console.log(`Replaced ${substring.trim()} with ${p2.trim()}`);
        });
      }

      return p2;
    });
  }
};
