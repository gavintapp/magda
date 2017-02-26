return {
    title: dataset.title || dataset.name,
    description: dataset.notes,
    issued: dataset.metadata_created,
    modified: dataset.metadata_modified,
    languages: [dataset.language],
    publisher: dataset.organization.description,
    accrualPeriodicity: dataset.update_freq,
    spatial: dataset.spatial_coverage,
    temporal: {
        start: dataset.temporal_coverage_from,
        end: dataset.temporal_coverage_to
    },
    themes: [],
    keywords: dataset.tags.map(tag => tag.name),
    contactPoint: dataset.contact_point,
    landingPage: source.getDatasetLandingPageUrl(dataset.id)
};
