using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Posts.DTOs.Response;
using BloodDonationSupport.Domain.Posts.Entities;
using BloodDonationSupport.Domain.Posts.ValueObjects;
using MediatR;
using Microsoft.IdentityModel.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Posts.Commands
{
    public class CreatePostCommandHandler : IRequestHandler<CreatePostCommand, BaseResponse<PostResponse>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPostRepository _postRepository;
        private readonly IPostTagRepository _postTagRepository;

        public CreatePostCommandHandler(IUnitOfWork unitOfWork, IPostRepository postRepository, IPostTagRepository postTagRepository)
        {
            _unitOfWork = unitOfWork;
            _postRepository = postRepository;
            _postTagRepository = postTagRepository;
        }

        public async Task<BaseResponse<PostResponse>> Handle(CreatePostCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Request;

            //Bắt buộc phải có ít nhất 1 tag
            if (dto.TagNames == null || !dto.TagNames.Any())
                return BaseResponse<PostResponse>.FailureResponse("At least one tag is required.");

            //Check slug tồn tại
            if(await _postRepository.ExistsAsync(p=> p.Slug.Value == dto.Slug)) return BaseResponse<PostResponse>.FailureResponse($"Post with slug {dto.Slug} already exists.");

            // Tạo danh sách tag
            var tagsToAttach = new List<PostTag>();
            foreach (var tagName in dto.TagNames)
            {
                if(string.IsNullOrWhiteSpace(tagName)) continue;
                var normalizedSlug = tagName.Trim().ToLower().Replace(" ", "-");

                //check tag tồn tại chưa
                var existingTags = await _postTagRepository.FindAsync(t => t.TagSlug == normalizedSlug);
                var existingTag  = existingTags.FirstOrDefault();

                if (existingTag != null)
                {
                    tagsToAttach.Add(existingTag);
                }
                else
                {
                    // tạo tag mới
                    var newTag = new PostTag(tagName, normalizedSlug);
                    await _postTagRepository.AddAsync(newTag);
                    tagsToAttach.Add(newTag);
                }


            }
            if(!tagsToAttach.Any())
            {
                return BaseResponse<PostResponse>.FailureResponse("At least one valid tag is required.");
            }

            //Tạo Post entiy
            var post = new Post(
                new PostTitle(dto.Title),
                new PostSlug(dto.Slug),
                dto.Content,
                dto.Excerpt,
                dto.AuthorId
            );
            foreach (var tag in tagsToAttach)
            {
                post.AddTag(tag);
            }

            if(dto.IsPublished)
                post.Publish();


            //Lưu db

            await _postRepository.AddAsync(post);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            //return response

            var response = new PostResponse
            {
                Id = post.Id,
                Title = post.Title.Value,
                Slug = post.Slug.Value,
                Excerpt = post.Excerpt,
                IsPublished = post.IsPublished,
                CreatedAt = post.CreatedAt,
                PublishedAt = post.PublishedAt,
                Tags = post.Tags.Select(t => t.TagName).ToList()
            };

            return BaseResponse<PostResponse>.SuccessResponse(response, "Post created successfully");
        }
    }
}
