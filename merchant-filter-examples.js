// Mapbox GL JS Vector Tileset Filtering Examples
// Use with map.setFilter(layerId, filterExpression)

// ============================================
// BASIC FILTERS
// ============================================

// Single category
['==', ['get', 'c'], 1]

// Multiple categories (OR logic)
['match', ['get', 'c'], [1, 2, 3], true, false]

// Single boolean property
['==', ['get', 'cp'], 1]  // Has coupon

// Not equal
['!=', ['get', 'c'], 6]

// ============================================
// COMBINING FILTERS
// ============================================

// AND logic - ALL conditions must be true
['all',
  ['match', ['get', 'c'], [1, 2], true, false],  // Category 1 OR 2
  ['==', ['get', 'cp'], 1],                       // AND has coupon
  ['==', ['get', 'pt'], 1]                        // AND has points
]

// OR logic - ANY condition must be true
['any',
  ['==', ['get', 'c'], 1],      // Category 1
  ['==', ['get', 'cp'], 1],     // OR has coupon
  ['==', ['get', 'cm'], 1]      // OR has campaign
]

// Complex: (A AND B) OR C
['any',
  ['all',
    ['==', ['get', 'c'], 1],
    ['==', ['get', 'cp'], 1]
  ],
  ['==', ['get', 'g'], 21]
]

// ============================================
// VECTOR TILESET WITH CLUSTERS
// ============================================

// Apply filter to CLUSTERS layer
// Must preserve the cluster detection filter
const userFilter = ['all',
  ['match', ['get', 'c'], [1, 2], true, false],
  ['==', ['get', 'cp'], 1]
];

const clusterFilter = ['all',
  ['has', 'count'],  // This is the cluster identifier
  userFilter
];
map.setFilter('clusters', clusterFilter);

// Apply filter to CLUSTER LABELS
const clusterLabelFilter = ['all',
  ['>', ['get', 'count'], 1],  // Only label clusters with 2+ points
  userFilter
];
map.setFilter('cluster-count', clusterLabelFilter);

// Apply filter to UNCLUSTERED POINTS
const unclusteredFilter = ['all',
  ['!', ['has', 'count']],  // This identifies unclustered points
  userFilter
];
map.setFilter('unclustered-points', unclusteredFilter);

// ============================================
// NUMERIC RANGES
// ============================================

// Between values
['all',
  ['>=', ['get', 'price'], 1000],
  ['<=', ['get', 'price'], 5000]
]

// Greater than
['>', ['get', 'rating'], 4.5]

// Less than or equal
['<=', ['get', 'distance'], 1000]

// ============================================
// STRING OPERATIONS
// ============================================

// Check if property exists
['has', 'name']

// Check if property doesn't exist
['!', ['has', 'name']]

// Match multiple string values
['match', ['get', 'status'], ['active', 'pending'], true, false]

// ============================================
// ADVANCED PATTERNS
// ============================================

// Filter by multiple properties with priority
['case',
  ['==', ['get', 'priority'], 'high'], true,
  ['==', ['get', 'featured'], true], true,
  false
]

// Filter based on calculated value
['>', ['*', ['get', 'rating'], ['get', 'reviews']], 100]

// Nested conditions
['all',
  ['match', ['get', 'c'], [1, 2], true, false],
  ['any',
    ['==', ['get', 'cp'], 1],
    ['all',
      ['==', ['get', 'cm'], 1],
      ['>', ['get', 'discount'], 10]
    ]
  ]
]

// ============================================
// COMPLETE WORKING EXAMPLE
// ============================================

function buildAndApplyFilters(map, selectedCategories, selectedGenres, hasCoupon) {
  // Start with 'all' to combine multiple conditions
  const filters = ['all'];

  // Add category filter if selections exist
  if (selectedCategories.length > 0) {
    filters.push([
      'match',
      ['get', 'c'],
      selectedCategories.map(Number),
      true,
      false
    ]);
  }

  // Add genre filter if selections exist
  if (selectedGenres.length > 0) {
    filters.push([
      'match',
      ['get', 'g'],
      selectedGenres.map(Number),
      true,
      false
    ]);
  }

  // Add boolean filter
  if (hasCoupon) {
    filters.push(['==', ['get', 'cp'], 1]);
  }

  // Get the user filter (or null if no filters selected)
  const userFilter = filters.length > 1 ? filters : null;

  // Apply to clusters
  map.setFilter('clusters',
    userFilter ? ['all', ['has', 'count'], userFilter] : ['has', 'count']
  );

  // Apply to cluster labels
  map.setFilter('cluster-count',
    userFilter ? ['all', ['>', ['get', 'count'], 1], userFilter] : ['>', ['get', 'count'], 1]
  );

  // Apply to unclustered points
  map.setFilter('unclustered-points',
    userFilter ? ['all', ['!', ['has', 'count']], userFilter] : ['!', ['has', 'count']]
  );
}

// Usage
buildAndApplyFilters(map, [1, 2, 3], [11, 12], true);

// ============================================
// RESET FILTERS
// ============================================

function resetAllFilters(map) {
  map.setFilter('clusters', ['has', 'count']);
  map.setFilter('cluster-count', ['>', ['get', 'count'], 1]);
  map.setFilter('unclustered-points', ['!', ['has', 'count']]);
}

// ============================================
// QUERY FILTERED FEATURES
// ============================================

// Get all visible features after filtering
const visibleFeatures = map.queryRenderedFeatures({
  layers: ['unclustered-points', 'clusters']
});
console.log('Visible features:', visibleFeatures.length);

// Get features at a specific point
const featuresAtPoint = map.queryRenderedFeatures(point, {
  layers: ['unclustered-points']
});

// Get source features (all data, not just visible)
const sourceFeatures = map.querySourceFeatures('merchants-clustered', {
  sourceLayer: 'merchants',
  filter: ['==', ['get', 'c'], 1]
});

// ============================================
// DEBUGGING TIPS
// ============================================

// Log the filter being applied
const filter = ['all', ['has', 'count'], ['==', ['get', 'c'], 1]];
console.log('Applying filter:', JSON.stringify(filter, null, 2));
map.setFilter('clusters', filter);

// Check if filter is working
map.on('sourcedata', (e) => {
  if (e.sourceId === 'merchants-clustered' && e.isSourceLoaded) {
    const features = map.querySourceFeatures('merchants-clustered', {
      sourceLayer: 'merchants'
    });
    console.log('Total source features:', features.length);

    const visible = map.queryRenderedFeatures({
      layers: ['unclustered-points']
    });
    console.log('Visible filtered features:', visible.length);
  }
});

// ============================================
// COMMON MISTAKES TO AVOID
// ============================================

// WRONG: Forgetting the base filter
map.setFilter('clusters', ['match', ['get', 'c'], [1, 2], true, false]);
// This breaks clustering because it removes ['has', 'count']

// CORRECT: Preserve base filter
map.setFilter('clusters', [
  'all',
  ['has', 'count'],
  ['match', ['get', 'c'], [1, 2], true, false]
]);

// WRONG: Type mismatch
map.setFilter('layer', ['==', ['get', 'c'], '1']);  // String '1'
// If property 'c' is a number, this won't match

// CORRECT: Match data types
map.setFilter('layer', ['==', ['get', 'c'], 1]);  // Number 1

// WRONG: Empty array in match
map.setFilter('layer', ['match', ['get', 'c'], [], true, false]);
// This will show nothing

// CORRECT: Check before applying
if (categories.length > 0) {
  map.setFilter('layer', ['match', ['get', 'c'], categories, true, false]);
} else {
  map.setFilter('layer', null);  // Show all
}
