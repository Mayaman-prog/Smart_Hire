import React, { useState } from 'react';
import Tag from '../Tag/Tag';
import './TagGroup.css';

const TagGroup = ({ tags, maxDisplay = 3, showExpand = true }) => {
    const [expanded, setExpanded] = useState(false);
    
    if (!tags || tags.length === 0) {
        return null;
    }

    const hasMore = tags.length > maxDisplay;
    const displayTags = expanded ? tags : tags.slice(0, maxDisplay);
    const remainingCount = tags.length - maxDisplay;

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    return (
        <div className="tag-group">
            {displayTags.map((tag, index) => (
                <Tag
                    key={index}
                    type={tag.type}
                    removable={tag.removable}
                    onRemove={tag.onRemove}
                >
                    {tag.label}
                </Tag>
            ))}
            
            {hasMore && !expanded && showExpand && (
                <button className="tag-more-btn" onClick={toggleExpand}>
                    +{remainingCount} more
                </button>
            )}
            
            {hasMore && expanded && showExpand && (
                <button className="tag-less-btn" onClick={toggleExpand}>
                    Show less
                </button>
            )}
        </div>
    );
};

export default TagGroup;