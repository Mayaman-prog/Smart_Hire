import React, { useState } from 'react';
import Tag from '../../components/common/Tag/Tag';
import TagGroup from '../../components/common/TagGroup/TagGroup';
import './TagTestPage.css';

const TagTestPage = () => {
    // All tag variants
    const allTagVariants = [
        { type: 'full-time', label: 'Full-time' },
        { type: 'part-time', label: 'Part-time' },
        { type: 'remote', label: 'Remote' },
        { type: 'contract', label: 'Contract' },
        { type: 'internship', label: 'Internship' },
        { type: 'featured', label: 'Featured' }
    ];

    // Removable tags example
    const [removableTags, setRemovableTags] = useState([
        { id: 1, type: 'full-time', label: 'Full-time' },
        { id: 2, type: 'remote', label: 'Remote' },
        { id: 3, type: 'featured', label: 'Featured' }
    ]);

    // Many tags for +more feature
    const manyTags = [
        { type: 'full-time', label: 'Full-time' },
        { type: 'remote', label: 'Remote' },
        { type: 'featured', label: 'Featured' },
        { type: 'contract', label: 'Contract' },
        { type: 'internship', label: 'Internship' },
        { type: 'part-time', label: 'Part-time' }
    ];

    const removeTag = (idToRemove) => {
        setRemovableTags(removableTags.filter(tag => tag.id !== idToRemove));
    };

    const tagsWithRemove = removableTags.map(tag => ({
        type: tag.type,
        label: tag.label,
        removable: true,
        onRemove: () => removeTag(tag.id)
    }));

    return (
        <div className="tag-test-page">
            <div className="container">
                <h1 className="page-title">Tag Components Demo</h1>
                
                {/* Section 1: All Tag Variants */}
                <div className="demo-section">
                    <h2 className="section-title">All Tag Variants</h2>
                    <div className="tag-demo">
                        {allTagVariants.map((tag, index) => (
                            <Tag key={index} type={tag.type}>
                                {tag.label}
                            </Tag>
                        ))}
                    </div>
                </div>

                {/* Section 2: Removable Tags */}
                <div className="demo-section">
                    <h2 className="section-title">Removable Tags (Click X to remove)</h2>
                    <div className="tag-demo">
                        {tagsWithRemove.map((tag, index) => (
                            <Tag
                                key={index}
                                type={tag.type}
                                removable={tag.removable}
                                onRemove={tag.onRemove}
                            >
                                {tag.label}
                            </Tag>
                        ))}
                    </div>
                    {removableTags.length === 0 && (
                        <p className="empty-message">All tags removed! Refresh to see them again.</p>
                    )}
                </div>

                {/* Section 3: TagGroup with +more */}
                <div className="demo-section">
                    <h2 className="section-title">TagGroup with "+more" Feature</h2>
                    <p className="section-description">Max display: 3 tags, shows +3 more</p>
                    <TagGroup tags={manyTags} maxDisplay={3} />
                </div>

                {/* Section 4: Custom maxDisplay */}
                <div className="demo-section">
                    <h2 className="section-title">Custom Max Display (2 tags)</h2>
                    <p className="section-description">Shows only 2 tags, then +4 more</p>
                    <TagGroup tags={manyTags} maxDisplay={2} />
                </div>

                {/* Section 5: Responsive Wrapping Demo */}
                <div className="demo-section">
                    <h2 className="section-title">Responsive Wrapping</h2>
                    <p className="section-description">Tags wrap on smaller screens</p>
                    <div className="responsive-demo">
                        <Tag type="full-time">Full-time</Tag>
                        <Tag type="remote">Remote</Tag>
                        <Tag type="featured">Featured</Tag>
                        <Tag type="contract">Contract</Tag>
                        <Tag type="internship">Internship</Tag>
                        <Tag type="part-time">Part-time</Tag>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TagTestPage;