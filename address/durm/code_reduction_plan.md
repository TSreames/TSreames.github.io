# Code Reduction Plan for durm_schools.js

## Next Most Obvious Change: Consolidate Duplicate Attribute Assignment

**Current:** Lines 330-347, 352-369, and 377-394 repeat the exact same attribute assignment pattern
**Reduction:** ~35 lines saved

### Add this helper function:
```javascript
copySchoolAttributes: function(target, source) {
  const attrs = source.attributes;
  Object.assign(target, {
    agencyurl: attrs.agencyurl,
    agency: attrs.agency,
    agencytype: attrs.agencytype,
    caltype: attrs.caltype,
    spectype: attrs.spectype,
    factype: attrs.factype,
    fulladdr: attrs.fulladdr,
    grades: attrs.grades,
    municipality: attrs.municipality,
    schoolpoint_name: attrs.name,
    numstudent: attrs.numstudent,
    operdays: attrs.operdays,
    operhours: attrs.operhours,
    phone: attrs.phone,
    pocemail: attrs.pocemail,
    pocname: attrs.pocname,
    pocphone: attrs.pocphone,
    prektype: attrs.prektype
  });
}
```

### Replace lines 328-397 with:
```javascript
else if (result.length == 1) {
  this.copySchoolAttributes(s, result[0]);
}
else {
  // Step 1: do the first record
  this.copySchoolAttributes(s, result[0]);
  // Step 2: do the rest of the records, but add them as new items
  for(var i = 1; i < result.length; i++) {
    let newZone = {
      type: s.type,
      name: s.name,
      facilityid: s.facilityid,
      stateid: s.stateid
    };
    this.copySchoolAttributes(newZone, result[i]);
    unique_list_of_zones.push(newZone);
  }
}
```

**Result:** Same exact functionality, ~35 fewer lines of code.