const DEBUG = false;

console.log("Loaded stripAbsolute helper");

module.exports = {
  /**
   * Handlebar helper that takes a fileName and strips out all the information before the first
   * node_modules reference. In other words, translates something like C:\USERS\USER\project\node_modules\module\file.js
   * to node_modules\module\file.js.
   * 
   * **Usage**
   * ```handlebars
   * <p>{{stripAbsolute "C:\\USERS\USER\\project\\node_modules\\module\\file.js"}}</p>
   * <p>{{stripAbsolute someVariableName}}</p>
   * ```
   * 
   * @param {string} fileName The file name to sanitize.
   * 
   * @returns {string} The sanitized file name.
   */
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
